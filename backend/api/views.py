import json
import time
import queue
import threading
from datetime import datetime, timedelta
from django.http import StreamingHttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import (
    DemoRequest,
    PricingPlan,
    CompanyOrganization,
    ProductAdminUser,
    ClientCompany,
    WorkspaceUser,
    ProjectMOU,
    PaymentRecord,
    CommunityPost,
    ChatMessage,
    DeliverableResource,
    SystemIntegrationSettings,
    CompanySettingsConfig,
    WorkspaceBatch,
)
from .serializers import (
    DemoRequestSerializer,
    PricingPlanSerializer,
    CompanyOrganizationSerializer,
    ProductAdminUserSerializer,
    ClientCompanySerializer,
    WorkspaceUserSerializer,
    ProjectMOUSerializer,
    PaymentRecordSerializer,
    CommunityPostSerializer,
    ChatMessageSerializer,
    DeliverableResourceSerializer,
    SystemIntegrationSettingsSerializer,
    CompanySettingsConfigSerializer,
    WorkspaceBatchSerializer,
)

# In-memory thread-safe event bus for real-time SSE broadcasts
_listeners = set()
_listeners_lock = threading.Lock()

def add_listener(q):
    with _listeners_lock:
        _listeners.add(q)

def remove_listener(q):
    with _listeners_lock:
        _listeners.discard(q)

def broadcast_demo_event(event_type, payload):
    with _listeners_lock:
        dead = []
        for q in _listeners:
            try:
                q.put_nowait({'type': event_type, 'data': payload, 'timestamp': time.time()})
            except (queue.Full, Exception):
                dead.append(q)
        for q in dead:
            _listeners.discard(q)


@api_view(['GET'])
def health_check(request):
    """
    Base health-check endpoint to verify backend connectivity.
    """
    total_demo_requests = DemoRequest.objects.count()
    return Response({
        'status': 'online',
        'backend': 'Django + Django REST Framework + PostgreSQL',
        'app': 'api',
        'demo_requests_count': total_demo_requests,
        'message': 'Django backend initialized successfully with real-time demo request pipeline.'
    })


@api_view(['GET', 'POST'])
def demo_requests_list_create(request):
    """
    GET: List all demo requests stored in database.
    POST: Create a new demo request from the public brochure form.
    """
    if request.method == 'GET':
        requests = DemoRequest.objects.all().order_by('-created_at')
        serializer = DemoRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = DemoRequestSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = DemoRequestSerializer(instance).data
            # Real-time event push to any open Product Admin sessions
            broadcast_demo_event('demo_request_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def demo_request_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual demo request.
    """
    try:
        instance = DemoRequest.objects.get(pk=pk)
    except DemoRequest.DoesNotExist:
        return Response({'detail': f'Demo request {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DemoRequestSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = DemoRequestSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            data = DemoRequestSerializer(updated_instance).data
            broadcast_demo_event('demo_request_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
        broadcast_demo_event('demo_request_deleted', {'id': pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def demo_request_credential(request, pk):
    """
    Generate or toggle temporary credentials for a demo request.
    """
    try:
        instance = DemoRequest.objects.get(pk=pk)
    except DemoRequest.DoesNotExist:
        return Response({'detail': f'Demo request {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', 'create')

    if action == 'toggle':
        is_active = request.data.get('isActive', False)
        if instance.dummy_credential:
            instance.dummy_credential['isActive'] = is_active
            instance.save()
            data = DemoRequestSerializer(instance).data
            broadcast_demo_event('demo_request_updated', data)
            return Response(data)
        return Response({'detail': 'No dummy credential exists to toggle.'}, status=status.HTTP_400_BAD_REQUEST)

    # Action: create credential
    temporary_password = request.data.get('temporaryPassword')
    if not temporary_password:
        import random
        temporary_password = f"Demo#{random.randint(1000, 9999)}"

    duration_days = int(request.data.get('durationDays', 14))
    expiry_date = (datetime.now() + timedelta(days=duration_days)).strftime('%Y-%m-%d')

    instance.status = 'credential_created'
    instance.dummy_credential = {
        'username': instance.email,
        'temporaryPassword': temporary_password,
        'expiresAt': expiry_date,
        'isActive': True,
    }
    instance.save()

    data = DemoRequestSerializer(instance).data
    broadcast_demo_event('demo_request_updated', data)
    return Response(data, status=status.HTTP_200_OK)


def demo_requests_stream(request):
    """
    Server-Sent Events (SSE) endpoint providing real-time streaming updates
    to the Product Admin dashboard.
    """
    def event_stream():
        q = queue.Queue(maxsize=100)
        add_listener(q)
        try:
            # Yield initial connection confirmation
            init_payload = json.dumps({'type': 'connected', 'timestamp': time.time()})
            yield f"event: connected\ndata: {init_payload}\n\n"

            while True:
                try:
                    # Wait for up to 15 seconds for a new event
                    event = q.get(timeout=15)
                    data_json = json.dumps(event)
                    yield f"event: demo_event\ndata: {data_json}\n\n"
                except queue.Empty:
                    # Heartbeat keep-alive
                    ping_payload = json.dumps({'type': 'ping', 'timestamp': time.time()})
                    yield f"event: ping\ndata: {ping_payload}\n\n"
        except GeneratorExit:
            pass
        finally:
            remove_listener(q)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


@api_view(['POST'])
def seed_initial_demo_requests(request):
    """
    Seed initial demo requests from initialData if the database table is empty.
    """
    if DemoRequest.objects.count() > 0:
        return Response({'message': f'Database already has {DemoRequest.objects.count()} demo requests.'})

    sample_requests = [
        {
            'id': 'demo_101',
            'name': 'Marcus Vance',
            'email': 'marcus.v@acmelogistics.com',
            'phone': '+1 (555) 234-5678',
            'company_name': 'Acme Global Logistics',
            'team_size': '25-100 members',
            'requirements': 'Need automated multi-batch reporting with client PDF attendance summaries.',
            'submitted_at': '2026-03-01 10:15',
            'status': 'credential_created',
            'dummy_credential': {
                'username': 'marcus.v@acmelogistics.com',
                'temporaryPassword': 'DemoPass#2026',
                'expiresAt': '2026-04-15',
                'isActive': True,
            },
        },
        {
            'id': 'demo_102',
            'name': 'Elena Rostova',
            'email': 'elena@novapharma.org',
            'phone': '+1 (555) 345-6789',
            'company_name': 'Nova BioPharma',
            'team_size': '10-25 members',
            'requirements': 'HIPAA-compliant document sharing and meeting notes transcription.',
            'submitted_at': '2026-03-02 14:20',
            'status': 'pending',
            'dummy_credential': None,
        },
        {
            'id': 'demo_103',
            'name': 'David Chen',
            'email': 'david@apexfintech.io',
            'phone': '+1 (555) 456-7890',
            'company_name': 'Apex FinTech Solutions',
            'team_size': '100+ Enterprise',
            'requirements': 'WhatsApp integration demo and resource review star-rating system needed for our enterprise clients.',
            'submitted_at': '2026-03-03 09:45',
            'status': 'pending',
            'dummy_credential': None,
        },
    ]

    created_count = 0
    for item in sample_requests:
        DemoRequest.objects.create(**item)
        created_count += 1

    return Response({'message': f'Successfully seeded {created_count} demo requests.'})


@api_view(['GET', 'POST'])
def pricing_plans_list_create(request):
    """
    GET: List all pricing plans stored in PostgreSQL.
    POST: Create a new pricing plan and broadcast live update.
    """
    if request.method == 'GET':
        plans = PricingPlan.objects.all().order_by('monthly_price')
        serializer = PricingPlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = PricingPlanSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = PricingPlanSerializer(instance).data
            # Real-time event push to brochure and all admin tabs
            broadcast_demo_event('pricing_plan_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def pricing_plan_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual pricing plan.
    """
    try:
        instance = PricingPlan.objects.get(pk=pk)
    except PricingPlan.DoesNotExist:
        return Response({'detail': f'Pricing plan {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PricingPlanSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = PricingPlanSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            data = PricingPlanSerializer(updated_instance).data
            broadcast_demo_event('pricing_plan_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
        broadcast_demo_event('pricing_plan_deleted', {'id': pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def seed_initial_pricing_plans(request):
    """
    Seed initial pricing plans from mock data if table is empty.
    """
    if PricingPlan.objects.count() > 0:
        return Response({'message': f'Database already has {PricingPlan.objects.count()} pricing plans.'})

    sample_plans = [
        {
            'id': 'plan_starter',
            'name': 'Starter Tier',
            'tagline': 'Ideal for emerging teams & small client batches',
            'monthly_price': 3999,
            'yearly_price': 38000,
            'currency': 'INR',
            'currency_symbol': '₹',
            'popular': False,
            'features': [
                'Up to 15 Active Portal Users',
                '2 Dedicated Client Batches',
                'Automated Call Scheduling (Daily/Weekly)',
                'Team Community Forum with Threaded Replies',
                'Standard Attendance Logs',
                'Basic Email Notifications',
            ],
            'max_users': 15,
            'max_clients': 5,
            'whatsapp_integration': False,
            'email_alerts': True,
            'ai_transcripts': False,
            'custom_branding': False,
        },
        {
            'id': 'plan_pro',
            'name': 'Enterprise Professional',
            'tagline': 'Full collaborative power with AI transcripts and WhatsApp integration',
            'monthly_price': 11999,
            'yearly_price': 115000,
            'currency': 'INR',
            'currency_symbol': '₹',
            'popular': True,
            'features': [
                'Up to 100 Active Portal Users',
                'Unlimited Client Batches & Projects',
                'AI Call Summaries & Speaker Transcripts',
                'Interactive AI Q&A on Transcripts',
                'WhatsApp-Style Direct & Group Chat',
                'WhatsApp & Email Instant Alert Triggers',
                'Attendance Analytics & Downloadable PDF Reports',
                'Star Reviews & Resource Management',
            ],
            'max_users': 100,
            'max_clients': 30,
            'whatsapp_integration': True,
            'email_alerts': True,
            'ai_transcripts': True,
            'custom_branding': True,
        },
        {
            'id': 'plan_custom',
            'name': 'Corporate Unlimited',
            'tagline': 'Tailored for large organizations with custom SLA and dedicated infrastructure',
            'monthly_price': 31999,
            'yearly_price': 305000,
            'currency': 'INR',
            'currency_symbol': '₹',
            'popular': False,
            'features': [
                'Unlimited Users, Clients & Workers',
                'Multi-Level Product & Sub-Admin Delegation',
                'Custom LLM API Integration (Gemini / OpenAI)',
                'Enterprise WhatsApp Business API Hook',
                'Automated CSV Batch Onboarding & Defaults',
                '24/7 Dedicated Priority Technical Support',
                'Exportable Audit Logs & Custom PDF Branding',
            ],
            'max_users': 9999,
            'max_clients': 999,
            'whatsapp_integration': True,
            'email_alerts': True,
            'ai_transcripts': True,
            'custom_branding': True,
        },
    ]

    created = 0
    for p in sample_plans:
        PricingPlan.objects.create(**p)
        created += 1

    return Response({'message': f'Successfully seeded {created} pricing plans.'})


@api_view(['POST'])
def product_admin_login(request):
    """
    Validate Product Admin / Super Admin login credentials.
    1. Matches against .env -> logs in as product_super_admin (full platform access).
    2. Matches against ProductAdminUser in database -> logs in as product_admin (scoped company access).
    """
    import os
    raw_username = (request.data.get('username') or request.data.get('email') or '').strip().lower()
    raw_password = (request.data.get('password') or '').strip()

    expected_username = os.getenv('PRODUCT_ADMIN_USERNAME', os.getenv('VITE_PRODUCT_ADMIN_USERNAME', 'admin@product.com')).strip().lower()
    expected_password = os.getenv('PRODUCT_ADMIN_PASSWORD', os.getenv('VITE_PRODUCT_ADMIN_PASSWORD', 'Admin@12345')).strip()

    valid_super_usernames = {expected_username, 'admin@product.com', 'superadmin@omnisuite.io', 'admin'}

    # 1. Check Super Admin credentials
    if raw_username in valid_super_usernames and raw_password == expected_password:
        return Response({
            'success': True,
            'message': 'Product Super Admin authenticated successfully.',
            'user': {
                'id': 'user_super_admin',
                'name': 'Alexander Vance',
                'email': expected_username,
                'role': 'product_super_admin',
                'designation': 'Chief Product Officer',
                'assignedCompanyAdminIds': [],
            }
        }, status=status.HTTP_200_OK)

    # 2. Check Scoped Product Admin in database
    try:
        padmin = ProductAdminUser.objects.get(email__iexact=raw_username)
        if padmin.status == 'paused':
            return Response({
                'success': False,
                'message': 'This Product Administrator account is currently paused.'
            }, status=status.HTTP_403_FORBIDDEN)

        if padmin.password == raw_password:
            serializer = ProductAdminUserSerializer(padmin)
            return Response({
                'success': True,
                'message': f'Welcome back, {padmin.name}!',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Invalid password for Product Administrator account.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except ProductAdminUser.DoesNotExist:
        pass

    return Response({
        'success': False,
        'message': 'Invalid Product Admin credentials. Check email and password.'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def product_admin_info(request):
    """
    Return configured product admin username/email (never exposes password).
    """
    import os
    admin_username = os.getenv('PRODUCT_ADMIN_USERNAME', os.getenv('VITE_PRODUCT_ADMIN_USERNAME', 'admin@product.com')).strip().lower()
    return Response({
        'username': admin_username,
        'configured': True,
    })


@api_view(['GET', 'POST'])
def company_organizations_list_create(request):
    """
    GET: List all Company Organizations stored in PostgreSQL.
    POST: Create a new Company Organization with credentials & broadcast real-time event.
    """
    if request.method == 'GET':
        orgs = CompanyOrganization.objects.all().order_by('-created_at')
        serializer = CompanyOrganizationSerializer(orgs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = CompanyOrganizationSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            # Also ensure matching company_admin in WorkspaceUser
            WorkspaceUser.objects.update_or_create(
                id=instance.id,
                defaults={
                    'name': instance.admin_name,
                    'email': instance.admin_email,
                    'role': 'company_admin',
                    'company_id': instance.id,
                    'company_name': instance.company_name,
                    'batch_ids': [f'batch_{instance.id}'],
                    'phone': instance.phone or '',
                    'designation': 'Managing Director / Organization Admin',
                    'status': 'active' if instance.status != 'paused' else 'inactive',
                }
            )
            data = CompanyOrganizationSerializer(instance).data
            broadcast_demo_event('company_organization_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def company_organization_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual Company Organization.
    """
    try:
        instance = CompanyOrganization.objects.get(pk=pk)
    except CompanyOrganization.DoesNotExist:
        return Response({'detail': f'Company Organization {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CompanyOrganizationSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = CompanyOrganizationSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            WorkspaceUser.objects.update_or_create(
                id=updated.id,
                defaults={
                    'name': updated.admin_name,
                    'email': updated.admin_email,
                    'role': 'company_admin',
                    'company_id': updated.id,
                    'company_name': updated.company_name,
                    'phone': updated.phone or '',
                    'status': 'active' if updated.status != 'paused' else 'inactive',
                }
            )
            data = CompanyOrganizationSerializer(updated).data
            # Sync CompanySettingsConfig in PostgreSQL in real time
            comp_settings = CompanySettingsConfig.objects.filter(company_id=updated.id).first()
            if comp_settings:
                comp_settings.whatsapp_alerts_enabled = updated.whatsapp_enabled
                comp_settings.email_alerts_enabled = updated.email_enabled
                comp_settings.save()
                broadcast_demo_event('company_settings_updated', CompanySettingsConfigSerializer(comp_settings).data)

            broadcast_demo_event('company_organization_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
        WorkspaceUser.objects.filter(id=pk).delete()
        broadcast_demo_event('company_organization_deleted', {'id': pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def seed_initial_company_organizations(request):
    """
    Seed initial sample organizations from initialData if PostgreSQL table is empty.
    """
    if CompanyOrganization.objects.count() > 0:
        return Response({'message': f'Database already has {CompanyOrganization.objects.count()} organizations.'})

    sample_orgs = [
        {
            'id': 'comp_acme',
            'company_name': 'Acme Corporation',
            'admin_name': 'David Miller',
            'admin_email': 'admin@acmecorp.com',
            'password': 'AdminAcme@2026',
            'phone': '+1 (555) 345-6789',
            'website': 'https://acmecorp.com',
            'industry': 'Enterprise Cloud Logistics & Supply',
            'tier': 'Enterprise',
            'status': 'active',
            'total_clients': 12,
            'total_users': 48,
            'total_batches': 3,
            'active_meetings_count': 6,
            'storage_used_mb': 840,
            'whatsapp_enabled': True,
            'email_enabled': True,
        },
        {
            'id': 'comp_globex',
            'company_name': 'Globex International Ltd',
            'admin_name': 'Sarah Jenkins',
            'admin_email': 'sarah@globex.com',
            'password': 'GlobexPass#2026',
            'phone': '+1 (555) 789-0123',
            'website': 'https://globex.io',
            'industry': 'FinTech & Algorithmic Banking',
            'tier': 'Growth',
            'status': 'active',
            'total_clients': 6,
            'total_users': 24,
            'total_batches': 2,
            'active_meetings_count': 3,
            'storage_used_mb': 420,
            'whatsapp_enabled': True,
            'email_enabled': True,
        },
    ]

    created = 0
    for o in sample_orgs:
        CompanyOrganization.objects.create(**o)
        created += 1

    return Response({'message': f'Successfully seeded {created} company organizations.'})


@api_view(['GET', 'POST'])
def product_admin_users_list_create(request):
    """
    GET: List all Product Admins stored in PostgreSQL.
    POST: Create a new Product Admin with password & assigned company scope.
    """
    if request.method == 'GET':
        admins = ProductAdminUser.objects.all().order_by('-created_at')
        serializer = ProductAdminUserSerializer(admins, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ProductAdminUserSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = ProductAdminUserSerializer(instance).data
            broadcast_demo_event('product_admin_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def product_admin_user_detail(request, pk):
    """
    GET, PUT, DELETE a specific Product Admin.
    """
    try:
        instance = ProductAdminUser.objects.get(pk=pk)
    except ProductAdminUser.DoesNotExist:
        return Response({'error': 'Product Admin not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductAdminUserSerializer(instance)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProductAdminUserSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = ProductAdminUserSerializer(updated).data
            broadcast_demo_event('product_admin_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        admin_id = instance.id
        instance.delete()
        broadcast_demo_event('product_admin_deleted', {'id': admin_id})
        return Response({'success': True, 'message': 'Product Admin deleted.'})


@api_view(['POST'])
def seed_initial_product_admins(request):
    if ProductAdminUser.objects.count() > 0:
        return Response({'message': f'Database already has {ProductAdminUser.objects.count()} product admins.'})

    sample_admins = [
        {
            'id': 'user_prod_admin_1',
            'name': 'Jordan Hayes',
            'email': 'jordan.admin@omnisuite.io',
            'password': 'AdminPass#2026',
            'role': 'product_admin',
            'phone': '+1 (555) 700-1122',
            'designation': 'Product Operations Lead',
            'assigned_company_admin_ids': ['comp_acme', 'comp_globex'],
            'status': 'active',
        }
    ]
    created = 0
    for a in sample_admins:
        ProductAdminUser.objects.create(**a)
        created += 1

    return Response({'message': f'Successfully seeded {created} product admins.'})


@api_view(['GET', 'POST'])
def client_companies_list_create(request):
    """
    GET: List all client companies, optionally filtered by batchId or companyId.
    POST: Create a new client company in database and broadcast to SSE.
    """
    if request.method == 'GET':
        qs = ClientCompany.objects.all().order_by('-created_at')
        batch_id = request.query_params.get('batchId') or request.query_params.get('batch_id')
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        serializer = ClientCompanySerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ClientCompanySerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = ClientCompanySerializer(instance).data
            broadcast_demo_event('client_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def client_company_detail(request, pk):
    """
    GET, PUT, PATCH, DELETE a specific Client Company.
    """
    try:
        instance = ClientCompany.objects.get(pk=pk)
    except ClientCompany.DoesNotExist:
        return Response({'error': 'Client Company not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ClientCompanySerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = ClientCompanySerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = ClientCompanySerializer(updated).data
            broadcast_demo_event('client_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        client_id = instance.id
        instance.delete()
        broadcast_demo_event('client_deleted', {'id': client_id})
        return Response({'success': True, 'message': 'Client company deleted.'})


@api_view(['POST'])
def seed_initial_client_companies(request):
    """
    Seed initial client companies if database is empty.
    """
    if ClientCompany.objects.count() > 0:
        return Response({'message': f'Database already has {ClientCompany.objects.count()} client companies.'})

    seed_items = request.data if isinstance(request.data, list) and len(request.data) > 0 else [
        {
            'id': 'client_comp_1',
            'name': 'Globex Logistics Global',
            'client_name': 'Sarah Jenkins',
            'email': 'sarah.client@globex.com',
            'phone': '+1 (555) 441-2099',
            'description': 'Multinational supply chain freight partner seeking automated tracking and multi-tier portal access.',
            'website_url': 'https://globexlogistics.example.com',
            'documents': [
                {'name': 'SLA_Agreement_2026.pdf', 'url': '#', 'size': '2.4 MB'},
                {'name': 'Security_Audit_Report.pdf', 'url': '#', 'size': '4.1 MB'},
            ],
            'batch_id': 'batch_alpha',
            'company_id': 'comp_acme',
            'status': 'active',
        },
        {
            'id': 'client_comp_2',
            'name': 'Vertex Capital Partners',
            'client_name': 'David K. Miller',
            'email': 'david.miller@vertex.org',
            'phone': '+1 (555) 912-3344',
            'description': 'Private equity syndicate requiring weekly portfolio reporting and audited call transcripts.',
            'website_url': 'https://vertexcapital.example.org',
            'documents': [
                {'name': 'NonDisclosure_Agreement.pdf', 'url': '#', 'size': '1.2 MB'},
            ],
            'batch_id': 'batch_alpha',
            'company_id': 'comp_acme',
            'status': 'active',
        },
        {
            'id': 'client_comp_3',
            'name': 'OmniTrade Direct',
            'client_name': 'Julian Thorne',
            'email': 'julian@omnitrade.io',
            'phone': '+1 (555) 231-9081',
            'description': 'B2B cross-border marketplace scaling fulfillment networks and automated alerts.',
            'website_url': 'https://omnitrade.example.io',
            'documents': [
                {'name': 'Product_Requirements_Doc.pdf', 'url': '#', 'size': '3.6 MB'},
            ],
            'batch_id': 'batch_beta',
            'company_id': 'comp_acme',
            'status': 'active',
        },
    ]

    count = 0
    for item in seed_items:
        ser = ClientCompanySerializer(data=item)
        if ser.is_valid():
            ser.save()
            count += 1
        else:
            c_id = item.get('id')
            c_name = item.get('name') or item.get('companyName') or 'Client'
            c_cname = item.get('client_name') or item.get('clientName') or c_name
            c_email = item.get('email') or 'client@example.com'
            ClientCompany.objects.create(
                id=c_id,
                name=c_name,
                client_name=c_cname,
                email=c_email,
                phone=item.get('phone', ''),
                description=item.get('description', ''),
                website_url=item.get('websiteUrl') or item.get('website_url', ''),
                documents=item.get('documents', []),
                batch_id=item.get('batchId') or item.get('batch_id', 'batch_alpha'),
                company_id=item.get('companyId') or item.get('company_id', 'comp_acme'),
                status=item.get('status', 'active'),
            )
            count += 1

    return Response({'message': f'Successfully seeded {count} client companies.'})


@api_view(['GET', 'POST'])
def workspace_users_list_create(request):
    """
    GET: List all workspace users, optionally filtered by batchId, companyId, or role.
    POST: Create a new workspace user in database and broadcast to SSE.
    """
    if request.method == 'GET':
        # Ensure company organization admins exist as company_admin WorkspaceUser rows
        for org in CompanyOrganization.objects.all():
            WorkspaceUser.objects.get_or_create(
                id=org.id,
                defaults={
                    'name': org.admin_name,
                    'email': org.admin_email,
                    'role': 'company_admin',
                    'company_id': org.id,
                    'company_name': org.company_name,
                    'batch_ids': [f'batch_{org.id}'],
                    'phone': org.phone or '',
                    'designation': 'Managing Director / Organization Admin',
                    'status': 'active' if org.status != 'paused' else 'inactive',
                }
            )

        qs = WorkspaceUser.objects.all().order_by('-created_at')
        batch_id = request.query_params.get('batchId') or request.query_params.get('batch_id')
        if batch_id:
            qs = qs.filter(batch_ids__contains=[batch_id])
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        role = request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        serializer = WorkspaceUserSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WorkspaceUserSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = WorkspaceUserSerializer(instance).data
            broadcast_demo_event('user_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def workspace_user_detail(request, pk):
    """
    GET, PUT, PATCH, DELETE a specific Workspace User.
    """
    try:
        instance = WorkspaceUser.objects.get(pk=pk)
    except WorkspaceUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = WorkspaceUserSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = WorkspaceUserSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = WorkspaceUserSerializer(updated).data

            # If company admin, also sync CompanyOrganization in database
            if updated.role == 'company_admin':
                comp_id = updated.company_id or updated.id
                org = CompanyOrganization.objects.filter(id=comp_id).first()
                if org:
                    org.admin_name = updated.name
                    org.admin_email = updated.email
                    if updated.phone:
                        org.phone = updated.phone
                    org.save()
                    broadcast_demo_event('company_organization_updated', CompanyOrganizationSerializer(org).data)

            # If client, also sync ClientCompany contact info in database
            elif updated.role == 'client' and updated.company_id:
                client_comp = ClientCompany.objects.filter(id=updated.company_id).first()
                if client_comp:
                    client_comp.client_name = updated.name
                    client_comp.email = updated.email
                    if updated.phone:
                        client_comp.phone = updated.phone
                    client_comp.save()
                    broadcast_demo_event('client_updated', ClientCompanySerializer(client_comp).data)

            broadcast_demo_event('user_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user_id = instance.id
        instance.delete()
        broadcast_demo_event('user_deleted', {'id': user_id})
        return Response({'success': True, 'message': 'User deleted.'})


@api_view(['POST'])
def seed_initial_workspace_users(request):
    """
    Seed initial workspace users if database is empty or provided payload.
    """
    if WorkspaceUser.objects.count() > 0:
        return Response({'message': f'Database already has {WorkspaceUser.objects.count()} users.'})

    seed_items = request.data if isinstance(request.data, list) and len(request.data) > 0 else [
        {
            'id': 'user_super_admin',
            'name': 'Alexander Vance',
            'email': 'superadmin@omnisuite.io',
            'role': 'product_super_admin',
            'password': 'AdminPass#2026',
            'avatar': '',
            'batch_ids': ['batch_alpha', 'batch_beta', 'batch_gamma'],
            'status': 'active',
            'phone': '+1 (555) 019-2831',
            'designation': 'Chief Product Officer',
            'joined_date': '2024-01-15',
        },
        {
            'id': 'user_prod_admin_1',
            'name': 'Elena Rostova',
            'email': 'productadmin@omnisuite.io',
            'role': 'product_admin',
            'password': 'AdminPass#2026',
            'avatar': '',
            'batch_ids': ['batch_alpha'],
            'status': 'active',
            'phone': '+1 (555) 014-9921',
            'designation': 'Product Operations Lead',
            'joined_date': '2024-03-10',
            'assigned_company_admin_ids': ['user_comp_admin_1'],
        },
        {
            'id': 'user_comp_admin_1',
            'name': 'Marcus Sterling',
            'email': 'admin@acmecorp.com',
            'role': 'company_admin',
            'password': 'AdminAcme@2026',
            'company_id': 'comp_acme',
            'company_name': 'Acme Enterprise Solutions',
            'avatar': '',
            'batch_ids': ['batch_alpha', 'batch_beta'],
            'status': 'active',
            'phone': '+1 (555) 302-8811',
            'designation': 'Managing Director',
            'joined_date': '2024-02-01',
        },
        {
            'id': 'user_comp_admin_2',
            'name': 'Priya Sharma',
            'email': 'priya@apexlabs.com',
            'role': 'company_admin',
            'password': 'ApexPass#2026',
            'company_id': 'comp_apex',
            'company_name': 'Apex HealthTech Labs',
            'avatar': '',
            'batch_ids': ['batch_gamma'],
            'status': 'active',
            'phone': '+1 (555) 882-9900',
            'designation': 'Operations Director',
            'joined_date': '2024-04-12',
        },
        {
            'id': 'user_client_1',
            'name': 'Sarah Jenkins',
            'email': 'sarah.client@globex.com',
            'role': 'client',
            'password': 'Pass#2026',
            'company_id': 'comp_acme',
            'company_name': 'Globex Logistics Global',
            'avatar': '',
            'batch_ids': ['batch_alpha', 'batch_beta'],
            'status': 'active',
            'phone': '+1 (555) 441-2099',
            'designation': 'VP of Technology & Logistics',
            'joined_date': '2024-02-15',
        },
        {
            'id': 'user_client_2',
            'name': 'David K. Miller',
            'email': 'david.miller@vertex.org',
            'role': 'client',
            'password': 'Pass#2026',
            'company_id': 'comp_acme',
            'company_name': 'Vertex Capital Partners',
            'avatar': '',
            'batch_ids': ['batch_alpha'],
            'status': 'active',
            'phone': '+1 (555) 912-3344',
            'designation': 'Principal Partner',
            'joined_date': '2024-03-01',
        },
        {
            'id': 'user_worker_1',
            'name': 'Alex Rivera',
            'email': 'alex.dev@acme.internal',
            'role': 'work_user',
            'password': 'Pass#2026',
            'company_id': 'comp_acme',
            'company_name': 'Acme Enterprise Solutions',
            'avatar': '',
            'batch_ids': ['batch_alpha', 'batch_beta'],
            'status': 'active',
            'phone': '+1 (555) 774-8833',
            'designation': 'Senior Lead Architect',
            'joined_date': '2024-02-10',
        },
    ]
    count = 0
    for item in seed_items:
        ser = WorkspaceUserSerializer(data=item)
        if ser.is_valid():
            ser.save()
            count += 1
        else:
            WorkspaceUser.objects.create(
                id=item.get('id'),
                name=item.get('name', 'User'),
                email=item.get('email', 'user@example.com'),
                role=item.get('role', 'work_user'),
                password=item.get('password', 'Pass#2026'),
                avatar=item.get('avatar', ''),
                company_id=item.get('companyId') or item.get('company_id', ''),
                company_name=item.get('companyName') or item.get('company_name', ''),
                batch_ids=item.get('batchIds') or item.get('batch_ids', []),
                status=item.get('status', 'active'),
                phone=item.get('phone', ''),
                designation=item.get('designation', ''),
                joined_date=item.get('joinedDate') or item.get('joined_date', ''),
                assigned_company_admin_ids=item.get('assignedCompanyAdminIds') or item.get('assigned_company_admin_ids', [])
            )
            count += 1
    return Response({'message': f'Successfully seeded {count} workspace users.'})


# ==========================================
# Project MOU / Contract Views
# ==========================================
@api_view(['GET', 'POST'])
def project_mous_list_create(request):
    """
    GET: List all project MOUs, optionally filtered by companyId, clientCompanyId, or status.
    POST: Create a new project MOU, broadcast SSE event, and optionally create current month payment installment.
    """
    if request.method == 'GET':
        qs = ProjectMOU.objects.all().order_by('-created_at')
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        client_company_id = request.query_params.get('clientCompanyId') or request.query_params.get('client_company_id')
        if client_company_id:
            qs = qs.filter(client_company_id=client_company_id)
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = ProjectMOUSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ProjectMOUSerializer(data=request.data)
        if serializer.is_valid():
            mou = serializer.save()
            data = ProjectMOUSerializer(mou).data
            broadcast_demo_event('project_mou_created', data)

            auto_create_payment = request.data.get('autoCreatePayment', True)
            if auto_create_payment and mou.monthly_amount > 0:
                current_month = datetime.now().strftime('%Y-%m')
                due_day = mou.billing_day_of_month or 5
                due_date_str = f"{current_month}-{due_day:02d}"
                pay = PaymentRecord.objects.create(
                    project_mou_id=mou.id,
                    company_id=mou.company_id,
                    client_company_id=mou.client_company_id,
                    client_name=mou.client_name,
                    client_email=mou.client_email,
                    title=f"{datetime.now().strftime('%B %Y')} Retainer - {mou.project_title}",
                    billing_month=current_month,
                    amount=mou.monthly_amount,
                    currency=mou.currency,
                    currency_symbol=mou.currency_symbol,
                    due_date=due_date_str,
                    status='pending',
                )
                pay_data = PaymentRecordSerializer(pay).data
                broadcast_demo_event('payment_created', pay_data)

            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def project_mou_detail(request, pk):
    """
    GET, PUT, PATCH, DELETE a specific Project MOU.
    """
    try:
        instance = ProjectMOU.objects.get(pk=pk)
    except ProjectMOU.DoesNotExist:
        return Response({'error': f'Project MOU {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProjectMOUSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = ProjectMOUSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = ProjectMOUSerializer(updated).data
            broadcast_demo_event('project_mou_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
        broadcast_demo_event('project_mou_deleted', {'id': pk})
        return Response({'success': True, 'message': 'Project MOU deleted.'})


# ==========================================
# Payments & Monthly Billing Views
# ==========================================
@api_view(['GET', 'POST'])
def payments_list_create(request):
    """
    GET: List all payment records, optionally filtered by companyId, clientCompanyId, billingMonth, status.
    POST: Create a new payment record, broadcast SSE event.
    """
    if request.method == 'GET':
        today_str = datetime.now().strftime('%Y-%m-%d')
        # Check overdue items
        PaymentRecord.objects.filter(status='pending', due_date__lt=today_str).exclude(due_date='').update(status='overdue')

        qs = PaymentRecord.objects.all().order_by('-due_date', '-created_at')
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        client_company_id = request.query_params.get('clientCompanyId') or request.query_params.get('client_company_id')
        if client_company_id:
            qs = qs.filter(client_company_id=client_company_id)
        billing_month = request.query_params.get('billingMonth') or request.query_params.get('billing_month')
        if billing_month:
            qs = qs.filter(billing_month=billing_month)
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        project_mou_id = request.query_params.get('projectMouId') or request.query_params.get('project_mou_id')
        if project_mou_id:
            qs = qs.filter(project_mou_id=project_mou_id)

        serializer = PaymentRecordSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PaymentRecordSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = PaymentRecordSerializer(instance).data
            broadcast_demo_event('payment_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def payment_detail(request, pk):
    """
    GET, PUT, PATCH, DELETE a specific Payment Record.
    """
    try:
        instance = PaymentRecord.objects.get(pk=pk)
    except PaymentRecord.DoesNotExist:
        return Response({'error': f'Payment record {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PaymentRecordSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = PaymentRecordSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = PaymentRecordSerializer(updated).data
            broadcast_demo_event('payment_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
        broadcast_demo_event('payment_deleted', {'id': pk})
        return Response({'success': True, 'message': 'Payment record deleted.'})


@api_view(['POST'])
def payment_mark_paid(request, pk):
    """
    Quick endpoint to mark a payment as paid with payment date, method, transaction ref.
    """
    try:
        payment = PaymentRecord.objects.get(pk=pk)
    except PaymentRecord.DoesNotExist:
        return Response({'error': f'Payment {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    paid_date = request.data.get('paidDate') or request.data.get('paid_date') or datetime.now().strftime('%Y-%m-%d')
    payment_method = request.data.get('paymentMethod') or request.data.get('payment_method') or 'Bank Transfer (NEFT/RTGS)'
    transaction_ref = request.data.get('transactionReference') or request.data.get('transaction_reference') or f"UTR-{int(time.time() * 1000)}"
    notes = request.data.get('notes', payment.notes)

    payment.status = 'paid'
    payment.paid_date = paid_date
    payment.payment_method = payment_method
    payment.transaction_reference = transaction_ref
    payment.notes = notes
    payment.save()

    data = PaymentRecordSerializer(payment).data
    broadcast_demo_event('payment_updated', data)
    return Response({
        'success': True,
        'message': f"Payment of {payment.currency_symbol}{payment.amount} marked as paid successfully.",
        'payment': data,
    })


@api_view(['POST'])
def payment_send_reminder(request, pk):
    """
    Send an email reminder to the client for an outstanding/overdue payment.
    Updates reminder_sent to True and logs reminder_sent_at.
    """
    try:
        payment = PaymentRecord.objects.get(pk=pk)
    except PaymentRecord.DoesNotExist:
        return Response({'error': f'Payment {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    now_str = datetime.now().strftime('%Y-%m-%d %H:%M')
    payment.reminder_sent = True
    payment.reminder_sent_at = now_str
    payment.save()

    data = PaymentRecordSerializer(payment).data
    broadcast_demo_event('payment_updated', data)

    client_email = payment.client_email or 'client@example.com'
    email_subject = f"Friendly Reminder: Payment of {payment.currency_symbol}{payment.amount} Due for {payment.billing_month}"
    email_body = (
        f"Dear {payment.client_name},\n\n"
        f"This is a reminder regarding invoice #{payment.invoice_number} for '{payment.title}'.\n"
        f"Amount Due: {payment.currency_symbol}{payment.amount:,.2f}\n"
        f"Due Date: {payment.due_date}\n\n"
        f"Please review and submit your transaction details in your client portal.\n\n"
        f"Sincerely,\nFinance & Accounts Department"
    )

    return Response({
        'success': True,
        'message': f"Payment reminder email successfully queued and sent to {client_email}.",
        'emailDetails': {
            'to': client_email,
            'subject': email_subject,
            'sentAt': now_str,
            'preview': email_body,
        },
        'payment': data,
    })


@api_view(['POST'])
def seed_initial_payments(request):
    """
    Seed initial Project MOUs and Payment Records if database is empty.
    """
    if ProjectMOU.objects.count() > 0 and PaymentRecord.objects.count() > 0:
        return Response({
            'message': f'Database already has {ProjectMOU.objects.count()} MOUs and {PaymentRecord.objects.count()} payments.'
        })

    # Sample MOUs
    sample_mous = [
        {
            'id': 'mou_globex_1',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_1',
            'client_name': 'Sarah Jenkins',
            'client_email': 'sarah.client@globex.com',
            'project_title': 'Enterprise Cloud Logistics Automation & Maintenance Agreement',
            'description': 'End-to-end cloud infrastructure management, 24/7 telemetry monitoring, and warehouse ERP integration SLA.',
            'total_amount': 900000.0,
            'monthly_amount': 75000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'billing_frequency': 'monthly',
            'billing_day_of_month': 5,
            'start_date': '2026-01-01',
            'end_date': '2026-12-31',
            'status': 'active',
            'mou_terms': '1. Scope covers multi-cloud container orchestration and monthly maintenance.\n2. Invoices generated on the 1st of every month, payable on or before 5th.\n3. Uptime guarantee 99.9% with 2-hour critical response SLA.',
            'signed_date': '2026-01-05',
        },
        {
            'id': 'mou_vertex_2',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_2',
            'client_name': 'David K. Miller',
            'client_email': 'david.miller@vertex.org',
            'project_title': 'Financial Data Pipeline & Audited Portals Agreement',
            'description': 'Real-time syndication data stream pipelines, weekly encrypted board room transcripts, and secure portfolio vault.',
            'total_amount': 1440000.0,
            'monthly_amount': 120000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'billing_frequency': 'monthly',
            'billing_day_of_month': 25,
            'start_date': '2026-01-15',
            'end_date': '2026-12-31',
            'status': 'active',
            'mou_terms': '1. Provisioning private financial ledger pipelines.\n2. Bi-weekly review calls with AI transcripts.\n3. Payment due monthly on the 25th via corporate wire transfer.',
            'signed_date': '2026-01-18',
        },
        {
            'id': 'mou_omnitrade_3',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_3',
            'client_name': 'Julian Thorne',
            'client_email': 'julian@omnitrade.io',
            'project_title': 'Cross-Border Marketplace Integration & SLA Agreement',
            'description': 'Automated cross-border inventory synchronization, multi-currency checkout bridges, and client portal notification bots.',
            'total_amount': 540000.0,
            'monthly_amount': 45000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'billing_frequency': 'monthly',
            'billing_day_of_month': 5,
            'start_date': '2026-02-01',
            'end_date': '2026-12-31',
            'status': 'active',
            'mou_terms': '1. Dedicated B2B fulfillment pipeline maintenance.\n2. Monthly recurring fee of ₹45,000 due on 5th.\n3. Standard support windows 9 AM - 8 PM IST.',
            'signed_date': '2026-02-04',
        },
        {
            'id': 'mou_biocare_4',
            'company_id': 'comp_apex',
            'client_company_id': 'client_comp_4',
            'client_name': 'Dr. Raymond Scott',
            'client_email': 'raymond.scott@biocare-health.io',
            'project_title': 'HIPAA Clinical Analytics & Telemetry Support Agreement',
            'description': 'HIPAA-compliant patient telemetry analytics pipelines, automated clinical meeting transcripts, and compliance audit trail.',
            'total_amount': 1020000.0,
            'monthly_amount': 85000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'billing_frequency': 'monthly',
            'billing_day_of_month': 2,
            'start_date': '2026-02-15',
            'end_date': '2026-12-31',
            'status': 'active',
            'mou_terms': '1. Encrypted HIPAA data lake storage and audit logging.\n2. Automated monthly retainer due on the 2nd.',
            'signed_date': '2026-02-20',
        },
    ]

    mou_count = 0
    for m in sample_mous:
        if not ProjectMOU.objects.filter(pk=m['id']).exists():
            ProjectMOU.objects.create(**m)
            mou_count += 1

    # Sample Payment Records (Current month + Past months)
    sample_payments = [
        # Globex Logistics - October (Done / Paid)
        {
            'id': 'pay_globex_2026_10',
            'project_mou_id': 'mou_globex_1',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_1',
            'client_name': 'Sarah Jenkins',
            'client_email': 'sarah.client@globex.com',
            'title': 'October 2026 Retainer - Enterprise Cloud Logistics',
            'invoice_number': 'INV-202610-0101',
            'billing_month': '2026-10',
            'amount': 75000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-10-05',
            'status': 'paid',
            'paid_date': '2026-10-04',
            'payment_method': 'Bank Transfer (NEFT/RTGS)',
            'transaction_reference': 'UTR-9823481234',
            'notes': 'Received via HDFC Corporate Banking. Cleared.',
        },
        # Globex Logistics - September (Paid)
        {
            'id': 'pay_globex_2026_09',
            'project_mou_id': 'mou_globex_1',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_1',
            'client_name': 'Sarah Jenkins',
            'client_email': 'sarah.client@globex.com',
            'title': 'September 2026 Retainer - Enterprise Cloud Logistics',
            'invoice_number': 'INV-202609-0091',
            'billing_month': '2026-09',
            'amount': 75000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-09-05',
            'status': 'paid',
            'paid_date': '2026-09-04',
            'payment_method': 'Bank Transfer (NEFT/RTGS)',
            'transaction_reference': 'UTR-8823192831',
            'notes': 'Cleared on time.',
        },
        # Vertex Capital - October (Pending / Not Done yet this month, due Oct 25)
        {
            'id': 'pay_vertex_2026_10',
            'project_mou_id': 'mou_vertex_2',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_2',
            'client_name': 'David K. Miller',
            'client_email': 'david.miller@vertex.org',
            'title': 'October 2026 Retainer - Financial Data Pipeline',
            'invoice_number': 'INV-202610-0102',
            'billing_month': '2026-10',
            'amount': 120000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-10-25',
            'status': 'pending',
            'paid_date': '',
            'payment_method': '',
            'transaction_reference': '',
            'notes': 'Invoice emailed to Accounts Payable on Oct 1st.',
        },
        # Vertex Capital - September (Paid)
        {
            'id': 'pay_vertex_2026_09',
            'project_mou_id': 'mou_vertex_2',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_2',
            'client_name': 'David K. Miller',
            'client_email': 'david.miller@vertex.org',
            'title': 'September 2026 Retainer - Financial Data Pipeline',
            'invoice_number': 'INV-202609-0092',
            'billing_month': '2026-09',
            'amount': 120000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-09-25',
            'status': 'paid',
            'paid_date': '2026-09-24',
            'payment_method': 'Wire Transfer',
            'transaction_reference': 'UTR-9182371928',
            'notes': 'Received via wire transfer.',
        },
        # OmniTrade Direct - October (Overdue / Not Done, due was Oct 5)
        {
            'id': 'pay_omnitrade_2026_10',
            'project_mou_id': 'mou_omnitrade_3',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_3',
            'client_name': 'Julian Thorne',
            'client_email': 'julian@omnitrade.io',
            'title': 'October 2026 Retainer - Cross-Border Marketplace',
            'invoice_number': 'INV-202610-0103',
            'billing_month': '2026-10',
            'amount': 45000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-10-05',
            'status': 'overdue',
            'paid_date': '',
            'payment_method': '',
            'transaction_reference': '',
            'notes': 'Payment overdue. Automated email reminder ready to dispatch.',
        },
        # OmniTrade Direct - September (Paid)
        {
            'id': 'pay_omnitrade_2026_09',
            'project_mou_id': 'mou_omnitrade_3',
            'company_id': 'comp_acme',
            'client_company_id': 'client_comp_3',
            'client_name': 'Julian Thorne',
            'client_email': 'julian@omnitrade.io',
            'title': 'September 2026 Retainer - Cross-Border Marketplace',
            'invoice_number': 'INV-202609-0093',
            'billing_month': '2026-09',
            'amount': 45000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-09-05',
            'status': 'paid',
            'paid_date': '2026-09-07',
            'payment_method': 'UPI / Corporate NetBanking',
            'transaction_reference': 'UPI-3928172912',
            'notes': 'Paid via UPI.',
        },
        # BioCare Health - October (Paid)
        {
            'id': 'pay_biocare_2026_10',
            'project_mou_id': 'mou_biocare_4',
            'company_id': 'comp_apex',
            'client_company_id': 'client_comp_4',
            'client_name': 'Dr. Raymond Scott',
            'client_email': 'raymond.scott@biocare-health.io',
            'title': 'October 2026 Retainer - HIPAA Telemetry Analytics',
            'invoice_number': 'INV-202610-0104',
            'billing_month': '2026-10',
            'amount': 85000.0,
            'currency': 'INR',
            'currency_symbol': '₹',
            'due_date': '2026-10-02',
            'status': 'paid',
            'paid_date': '2026-10-02',
            'payment_method': 'Bank Transfer (NEFT/RTGS)',
            'transaction_reference': 'UTR-5544332211',
            'notes': 'Direct corporate debit.',
        },
    ]

    pay_count = 0
    for p in sample_payments:
        if not PaymentRecord.objects.filter(pk=p['id']).exists():
            PaymentRecord.objects.create(**p)
            pay_count += 1

    return Response({
        'message': f'Successfully seeded {mou_count} Project MOUs and {pay_count} Payment Records.'
    })


# ==========================================
# Team Community Forum Views (Real-time SSE)
# ==========================================
@api_view(['GET', 'POST'])
def community_posts_list_create(request):
    """
    GET: List all community posts, optionally filtered by batchId or companyId.
    POST: Create a new community post and broadcast SSE event to all users in real-time.
    """
    if request.method == 'GET':
        qs = CommunityPost.objects.all().order_by('-created_at')
        batch_id = request.query_params.get('batchId') or request.query_params.get('batch_id')
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        serializer = CommunityPostSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = CommunityPostSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = CommunityPostSerializer(instance).data
            # Real-time server push to all active community tabs
            broadcast_demo_event('community_post_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def community_post_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual community post with real-time SSE broadcasts.
    """
    try:
        post = CommunityPost.objects.get(pk=pk)
    except CommunityPost.DoesNotExist:
        return Response({'detail': f'Community post {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CommunityPostSerializer(post)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = CommunityPostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = CommunityPostSerializer(updated).data
            broadcast_demo_event('community_post_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        post_data = {'id': pk, 'batchId': post.batch_id}
        post.delete()
        broadcast_demo_event('community_post_deleted', post_data)
        return Response({'message': f'Post {pk} deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def community_post_toggle_like(request, pk):
    """
    Toggle like on a community post. Increments/decrements likes and updates likedBy array.
    """
    try:
        post = CommunityPost.objects.get(pk=pk)
    except CommunityPost.DoesNotExist:
        return Response({'detail': f'Community post {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    user_id = request.data.get('userId') or request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'userId is required to toggle like.'}, status=status.HTTP_400_BAD_REQUEST)

    liked_by = list(post.liked_by or [])
    if user_id in liked_by:
        liked_by.remove(user_id)
        post.likes = max(0, post.likes - 1)
    else:
        liked_by.append(user_id)
        post.likes = post.likes + 1

    post.liked_by = liked_by
    post.save()
    data = CommunityPostSerializer(post).data
    broadcast_demo_event('community_post_liked', data)
    return Response(data)


@api_view(['POST'])
def community_post_add_reply(request, pk):
    """
    Add a reply or nested reply to a community post.
    """
    try:
        post = CommunityPost.objects.get(pk=pk)
    except CommunityPost.DoesNotExist:
        return Response({'detail': f'Community post {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    reply_data = request.data
    reply_id = reply_data.get('id') or f"reply_{int(time.time() * 1000)}"
    created_at = reply_data.get('createdAt') or datetime.now().strftime('%Y-%m-%d %H:%M')

    new_reply = {
        'id': reply_id,
        'postId': pk,
        'parentReplyId': reply_data.get('parentReplyId'),
        'replyToUserName': reply_data.get('replyToUserName'),
        'authorId': reply_data.get('authorId', ''),
        'authorName': reply_data.get('authorName', 'Anonymous'),
        'authorRole': reply_data.get('authorRole', 'client'),
        'authorAvatar': reply_data.get('authorAvatar', ''),
        'content': reply_data.get('content', ''),
        'createdAt': created_at,
        'likes': int(reply_data.get('likes', 0)),
        'likedBy': reply_data.get('likedBy', []),
        'attachments': reply_data.get('attachments', []),
    }

    current_replies = list(post.replies or [])
    current_replies.append(new_reply)
    post.replies = current_replies
    post.save()

    data = CommunityPostSerializer(post).data
    broadcast_demo_event('community_reply_added', {'postId': pk, 'reply': new_reply, 'post': data})
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def community_post_delete_reply(request, pk, reply_pk):
    """
    Delete a reply from a community post.
    """
    try:
        post = CommunityPost.objects.get(pk=pk)
    except CommunityPost.DoesNotExist:
        return Response({'detail': f'Community post {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    current_replies = list(post.replies or [])
    updated_replies = [r for r in current_replies if r.get('id') != reply_pk]
    post.replies = updated_replies
    post.save()

    data = CommunityPostSerializer(post).data
    broadcast_demo_event('community_reply_deleted', {'postId': pk, 'replyId': reply_pk, 'post': data})
    return Response(data)


@api_view(['POST'])
def community_post_toggle_like_reply(request, pk, reply_pk):
    """
    Toggle like on a reply inside a community post.
    """
    try:
        post = CommunityPost.objects.get(pk=pk)
    except CommunityPost.DoesNotExist:
        return Response({'detail': f'Community post {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    user_id = request.data.get('userId') or request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'userId is required.'}, status=status.HTTP_400_BAD_REQUEST)

    current_replies = list(post.replies or [])
    found = False
    for r in current_replies:
        if r.get('id') == reply_pk:
            liked_by = list(r.get('likedBy') or [])
            if user_id in liked_by:
                liked_by.remove(user_id)
                r['likes'] = max(0, int(r.get('likes', 1)) - 1)
            else:
                liked_by.append(user_id)
                r['likes'] = int(r.get('likes', 0)) + 1
            r['likedBy'] = liked_by
            found = True
            break

    if not found:
        return Response({'detail': f'Reply {reply_pk} not found in post {pk}.'}, status=status.HTTP_404_NOT_FOUND)

    post.replies = current_replies
    post.save()

    data = CommunityPostSerializer(post).data
    broadcast_demo_event('community_reply_liked', {'postId': pk, 'replyId': reply_pk, 'post': data})
    return Response(data)


@api_view(['POST'])
def seed_initial_community_posts(request):
    """
    Seed initial realistic community posts and threaded discussions if table is empty.
    """
    initial_items = request.data if isinstance(request.data, list) and len(request.data) > 0 else []

    if not initial_items:
        initial_items = [
            {
                'id': 'post_01',
                'batch_id': 'batch_alpha',
                'company_id': 'comp_acme',
                'author_id': 'user_comp_admin_1',
                'author_name': 'Marcus Sterling',
                'author_role': 'company_admin',
                'author_avatar': '',
                'title': 'Welcome to Batch Alpha - Project Roadmap & Communication Protocol',
                'content': 'Welcome everyone! We have set up our weekly calls on Tuesdays and Thursdays. All project resources, architecture blueprints, and meeting transcripts will be published here. Please reply to this thread to confirm your access!',
                'tags': ['Announcement', 'Roadmap', 'Kickoff'],
                'created_at_display': '2026-10-01 10:00',
                'likes': 6,
                'liked_by': ['user_client_1', 'user_worker_1', 'user_client_2'],
                'replies': [
                    {
                        'id': 'reply_01',
                        'postId': 'post_01',
                        'authorId': 'user_client_1',
                        'authorName': 'Sarah Jenkins',
                        'authorRole': 'client',
                        'authorAvatar': '',
                        'content': 'Thanks Marcus! The Globex engineering squad is fully synced and ready to collaborate.',
                        'createdAt': '2026-10-01 11:15',
                        'likes': 2,
                        'likedBy': ['user_comp_admin_1', 'user_worker_1'],
                    },
                    {
                        'id': 'reply_02',
                        'postId': 'post_01',
                        'parentReplyId': 'reply_01',
                        'replyToUserName': 'Sarah Jenkins',
                        'authorId': 'user_worker_1',
                        'authorName': 'Alex Rivera',
                        'authorRole': 'work_user',
                        'authorAvatar': '',
                        'content': 'Awesome Sarah! I just pushed the API documentation in the Resources tab for your review.',
                        'createdAt': '2026-10-01 11:42',
                        'likes': 3,
                        'likedBy': ['user_client_1', 'user_comp_admin_1', 'user_worker_2'],
                    },
                ],
            },
            {
                'id': 'post_02',
                'batch_id': 'batch_alpha',
                'company_id': 'comp_acme',
                'author_id': 'user_worker_2',
                'author_name': 'Maya Lin',
                'author_role': 'work_user',
                'author_avatar': '',
                'title': 'Cloud Security Audit Completed - Zero Critical Vulnerabilities',
                'content': 'We successfully concluded our automated vulnerability penetration test. The full compliance audit log has been uploaded to the Reports section.',
                'tags': ['Security', 'Audit', 'Compliance'],
                'created_at_display': '2026-10-04 16:20',
                'likes': 8,
                'liked_by': ['user_client_1', 'user_client_2', 'user_client_5', 'user_comp_admin_1'],
                'replies': [
                    {
                        'id': 'reply_03',
                        'postId': 'post_02',
                        'authorId': 'user_client_2',
                        'authorName': 'David K. Miller',
                        'authorRole': 'client',
                        'authorAvatar': '',
                        'content': 'Terrific news Maya. This is exactly what our compliance team requested for SOC2 Type II.',
                        'createdAt': '2026-10-04 17:05',
                        'likes': 1,
                        'likedBy': ['user_worker_2'],
                    },
                ],
            },
            {
                'id': 'post_03',
                'batch_id': 'batch_beta',
                'company_id': 'comp_acme',
                'author_id': 'user_comp_admin_1',
                'author_name': 'Marcus Sterling',
                'author_role': 'company_admin',
                'author_avatar': '',
                'title': 'Welcome to Batch Beta - Logistics Automation & Streaming Infrastructure',
                'content': 'Welcome partners! This cohort connects OmniTrade Direct and Horizon Media Networks with our engineering squad. Feel free to raise questions on webhook integrations, transcoding SLAs, or monthly payment schedules right here.',
                'tags': ['Announcement', 'Logistics', 'Kickoff'],
                'created_at_display': '2026-10-02 09:30',
                'likes': 5,
                'liked_by': ['user_client_3', 'user_client_6', 'user_worker_1'],
                'replies': [
                    {
                        'id': 'reply_04',
                        'postId': 'post_03',
                        'authorId': 'user_client_3',
                        'authorName': 'Julian Thorne',
                        'authorRole': 'client',
                        'authorAvatar': '',
                        'content': 'Glad to be here! The sandbox webhook endpoints are performing really well with sub-100ms response times.',
                        'createdAt': '2026-10-02 10:15',
                        'likes': 2,
                        'likedBy': ['user_comp_admin_1', 'user_client_6'],
                    },
                    {
                        'id': 'reply_05',
                        'postId': 'post_03',
                        'authorId': 'user_client_6',
                        'authorName': 'Marcus Vance',
                        'authorRole': 'client',
                        'authorAvatar': '',
                        'content': 'Thanks Marcus! Horizon Media is excited to benchmark the 1080p60 transcode cluster.',
                        'createdAt': '2026-10-02 11:00',
                        'likes': 3,
                        'likedBy': ['user_comp_admin_1', 'user_client_3', 'user_worker_1'],
                    },
                ],
            },
            {
                'id': 'post_04',
                'batch_id': 'batch_beta',
                'company_id': 'comp_acme',
                'author_id': 'user_worker_1',
                'author_name': 'Alex Rivera',
                'author_role': 'work_user',
                'author_avatar': '',
                'title': 'API Gateway v2.8 Deployed to Staging Sandbox',
                'content': 'The updated webhook dispatch engine with automated exponential backoff and idempotency headers is live on staging. Check out the specification guide in the Resources tab!',
                'tags': ['Engineering', 'Release', 'API'],
                'created_at_display': '2026-10-05 16:45',
                'likes': 4,
                'liked_by': ['user_client_3', 'user_client_6'],
                'replies': [
                    {
                        'id': 'reply_06',
                        'postId': 'post_04',
                        'authorId': 'user_client_3',
                        'authorName': 'Julian Thorne',
                        'authorRole': 'client',
                        'authorAvatar': '',
                        'content': 'Tested the idempotency header with duplicate payment events - worked like a charm!',
                        'createdAt': '2026-10-05 17:10',
                        'likes': 2,
                        'likedBy': ['user_worker_1', 'user_client_6'],
                    },
                ],
            },
        ]

    seeded_count = 0
    for item in initial_items:
        ser = CommunityPostSerializer(data=item)
        if ser.is_valid():
            if not CommunityPost.objects.filter(pk=item.get('id', '')).exists():
                ser.save()
                seeded_count += 1
        else:
            p_id = item.get('id') or f"post_{int(time.time() * 1000)}"
            if not CommunityPost.objects.filter(pk=p_id).exists():
                CommunityPost.objects.create(
                    id=p_id,
                    batch_id=item.get('batchId') or item.get('batch_id', 'batch_alpha'),
                    company_id=item.get('companyId') or item.get('company_id', 'comp_acme'),
                    author_id=item.get('authorId') or item.get('author_id', ''),
                    author_name=item.get('authorName') or item.get('author_name', 'Anonymous'),
                    author_role=item.get('authorRole') or item.get('author_role', 'client'),
                    author_avatar=item.get('authorAvatar') or item.get('author_avatar', ''),
                    title=item.get('title', ''),
                    content=item.get('content', ''),
                    tags=item.get('tags', []),
                    created_at_display=item.get('createdAt') or item.get('created_at_display', ''),
                    likes=int(item.get('likes', 0)),
                    liked_by=item.get('likedBy') or item.get('liked_by', []),
                    replies=item.get('replies', []),
                    attachment_url=item.get('attachmentUrl') or item.get('attachment_url', ''),
                    attachments=item.get('attachments', []),
                    links=item.get('links', []),
                )
                seeded_count += 1

    return Response({'message': f'Successfully seeded {seeded_count} Community Posts into database.'})


# ============================================================================
# CHAT MESSAGES & REAL-TIME WEBSOCKET/SSE STREAM (PostgreSQL Backed)
# ============================================================================

@api_view(['GET', 'POST'])
def chat_messages_list_create(request):
    """
    GET: List all chat messages, optionally filtered by batchId, recipientId, senderId.
    POST: Create a new chat message and broadcast in real-time via SSE.
    """
    if request.method == 'GET':
        batch_id = request.query_params.get('batchId')
        recipient_id = request.query_params.get('recipientId')
        sender_id = request.query_params.get('senderId')

        queryset = ChatMessage.objects.all().order_by('created_at')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)

        # Direct messages filter: between sender_id and recipient_id
        if recipient_id and sender_id and recipient_id != 'group':
            from django.db.models import Q
            queryset = queryset.filter(
                (Q(sender_id=sender_id, recipient_id=recipient_id)) |
                (Q(sender_id=recipient_id, recipient_id=sender_id))
            )
        elif recipient_id == 'group' or (request.query_params.get('isGroup') == 'true'):
            queryset = queryset.filter(recipient_id__isnull=True) | queryset.filter(recipient_id='')

        serializer = ChatMessageSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            broadcast_demo_event('chat_message_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def chat_message_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual chat message.
    """
    try:
        msg = ChatMessage.objects.get(pk=pk)
    except ChatMessage.DoesNotExist:
        return Response({'error': f'ChatMessage {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ChatMessageSerializer(msg)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = ChatMessageSerializer(msg, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            broadcast_demo_event('chat_message_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        msg.delete()
        broadcast_demo_event('chat_message_deleted', {'id': pk})
        return Response({'message': f'ChatMessage {pk} deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def chat_message_delete_for_me(request, pk):
    """
    POST: Delete/hide message for a specific user only ('Delete for me').
    Body: { "userId": "user_id_here" }
    """
    try:
        msg = ChatMessage.objects.get(pk=pk)
    except ChatMessage.DoesNotExist:
        return Response({'error': f'ChatMessage {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

    user_id = request.data.get('userId')
    if user_id:
        deleted_list = list(msg.deleted_for_user_ids or [])
        if user_id not in deleted_list:
            deleted_list.append(user_id)
            msg.deleted_for_user_ids = deleted_list
            msg.save()

    data = ChatMessageSerializer(msg).data
    broadcast_demo_event('chat_message_updated', data)
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def chat_messages_mark_read(request):
    """
    POST: Mark messages as 'read' (for WhatsApp-style blue double ticks).
    Body:
    {
        "messageIds": ["msg_01", "msg_02"],
        "readerId": "user_client_1"
    }
    or
    {
        "batchId": "batch_alpha",
        "senderId": "user_worker_1",
        "readerId": "user_client_1"
    }
    """
    message_ids = request.data.get('messageIds', [])
    reader_id = request.data.get('readerId', '')
    batch_id = request.data.get('batchId')
    sender_id = request.data.get('senderId')

    updated_ids = []
    if message_ids:
        msgs = ChatMessage.objects.filter(pk__in=message_ids).exclude(status='read')
        for m in msgs:
            m.status = 'read'
            m.save()
            updated_ids.append(m.id)
    elif batch_id and reader_id:
        query = ChatMessage.objects.filter(batch_id=batch_id).exclude(sender_id=reader_id).exclude(status='read')
        if sender_id and sender_id != 'group':
            query = query.filter(sender_id=sender_id)
        for m in query:
            m.status = 'read'
            m.save()
            updated_ids.append(m.id)

    if updated_ids:
        broadcast_demo_event('chat_messages_read', {
            'messageIds': updated_ids,
            'readerId': reader_id,
            'status': 'read'
        })

    return Response({
        'success': True,
        'updatedCount': len(updated_ids),
        'messageIds': updated_ids
    })


@api_view(['POST'])
def chat_upload_attachment(request):
    """
    POST: Upload multimedia attachment (photo, document, video) for chat message.
    Supports file uploads or base64 dataUrl payloads.
    """
    import os
    from django.core.files.storage import default_storage

    file_obj = request.FILES.get('file')
    if not file_obj:
        data_url = request.data.get('dataUrl')
        name = request.data.get('name', 'attachment')
        file_type = request.data.get('type', 'document')
        size_str = request.data.get('size', '1.0 MB')
        if data_url:
            return Response({
                'name': name,
                'type': file_type,
                'url': data_url,
                'size': size_str,
            })
        return Response({'error': 'No file or dataUrl provided'}, status=status.HTTP_400_BAD_REQUEST)

    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']:
        file_type = 'image'
    elif ext in ['.mp4', '.webm', '.mov', '.avi', '.mkv']:
        file_type = 'video'
    else:
        file_type = 'document'

    filename = f"chat_{int(time.time() * 1000)}_{file_obj.name}"
    save_path = os.path.join('chat_attachments', filename)
    saved_name = default_storage.save(save_path, file_obj)
    rel_url = default_storage.url(saved_name)
    file_url = request.build_absolute_uri(rel_url) if hasattr(request, 'build_absolute_uri') else rel_url
    size_mb = file_obj.size / (1024 * 1024)
    size_str = f"{size_mb:.1f} MB" if size_mb >= 1 else f"{int(file_obj.size / 1024)} KB"

    return Response({
        'name': file_obj.name,
        'type': file_type,
        'url': file_url,
        'size': size_str,
    })


@api_view(['POST'])
def seed_initial_chat_messages(request):
    """
    Seed initial realistic chat messages if table is empty.
    """
    initial_items = request.data if isinstance(request.data, list) and len(request.data) > 0 else []

    if not initial_items:
        initial_items = [
            {
                'id': 'msg_01',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_comp_admin_1',
                'senderName': 'Marcus Sterling',
                'senderRole': 'company_admin',
                'senderAvatar': '',
                'text': 'Good day team! The call agenda for today is posted in the Scheduling section.',
                'timestamp': '10:02 AM',
                'status': 'read',
            },
            {
                'id': 'msg_02',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_client_1',
                'senderName': 'Sarah Jenkins',
                'senderRole': 'client',
                'senderAvatar': '',
                'text': 'Reviewed! Will Alex be demonstrating the real-time webhook trigger?',
                'timestamp': '10:05 AM',
                'status': 'read',
            },
            {
                'id': 'msg_03',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_worker_1',
                'senderName': 'Alex Rivera',
                'senderRole': 'work_user',
                'senderAvatar': '',
                'text': 'Yes Sarah! The live sandbox environment is ready to demo.',
                'timestamp': '10:07 AM',
                'status': 'read',
            },
            {
                'id': 'msg_04',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_client_1',
                'senderName': 'Sarah Jenkins',
                'senderRole': 'client',
                'senderAvatar': '',
                'text': 'Perfect, joining now via the 1-click button!',
                'timestamp': '10:14 AM',
                'status': 'read',
            },
            {
                'id': 'msg_05',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_worker_1',
                'senderName': 'Alex Rivera',
                'senderRole': 'work_user',
                'senderAvatar': '',
                'text': 'Here is the high-level architecture diagram and API schema we reviewed during today\'s sprint sync.',
                'timestamp': '10:20 AM',
                'status': 'read',
                'attachment': {
                    'name': 'System_Architecture_Blueprint.png',
                    'type': 'image',
                    'url': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
                    'size': '2.4 MB',
                },
            },
            {
                'id': 'msg_06',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_comp_admin_1',
                'senderName': 'Marcus Sterling',
                'senderRole': 'company_admin',
                'senderAvatar': '',
                'text': 'Please find the countersigned Service Level Agreement (SLA) and monthly milestone schedule attached.',
                'timestamp': '10:35 AM',
                'status': 'delivered',
                'attachment': {
                    'name': 'Globex_SLA_Master_Agreement_2026.pdf',
                    'type': 'document',
                    'url': '#',
                    'size': '1.8 MB',
                },
            },
            {
                'id': 'msg_07',
                'batchId': 'batch_alpha',
                'companyId': 'comp_acme',
                'senderId': 'user_worker_2',
                'senderName': 'Maya Lin',
                'senderRole': 'work_user',
                'senderAvatar': '',
                'text': 'Sharing a quick walkthrough video demonstrating the webhook idempotency test run in staging.',
                'timestamp': '10:48 AM',
                'status': 'delivered',
                'attachment': {
                    'name': 'Staging_Webhook_Demo.mp4',
                    'type': 'video',
                    'url': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    'size': '4.2 MB',
                },
            },
            {
                'id': 'msg_b01',
                'batchId': 'batch_beta',
                'companyId': 'comp_acme',
                'senderId': 'user_comp_admin_1',
                'senderName': 'Marcus Sterling',
                'senderRole': 'company_admin',
                'senderAvatar': '',
                'text': 'Good morning Batch Beta! Daily logistics standup starts in 15 minutes.',
                'timestamp': '08:45 AM',
                'status': 'read',
            },
            {
                'id': 'msg_b02',
                'batchId': 'batch_beta',
                'companyId': 'comp_acme',
                'senderId': 'user_client_3',
                'senderName': 'Julian Thorne',
                'senderRole': 'client',
                'senderAvatar': '',
                'text': 'Will be there! Julian from OmniTrade joining from the terminal.',
                'timestamp': '08:48 AM',
                'status': 'read',
            },
            {
                'id': 'msg_b03',
                'batchId': 'batch_beta',
                'companyId': 'comp_acme',
                'senderId': 'user_client_6',
                'senderName': 'Marcus Vance',
                'senderRole': 'client',
                'senderAvatar': '',
                'text': 'Horizon Media operations team is ready with the live stream benchmark metrics.',
                'timestamp': '08:52 AM',
                'status': 'read',
            },
            {
                'id': 'msg_b04',
                'batchId': 'batch_beta',
                'companyId': 'comp_acme',
                'senderId': 'user_worker_1',
                'senderName': 'Alex Rivera',
                'senderRole': 'work_user',
                'senderAvatar': '',
                'text': 'Call is open on Google Meet. See everyone inside!',
                'timestamp': '08:58 AM',
                'status': 'read',
            },
            {
                'id': 'msg_g01',
                'batchId': 'batch_gamma',
                'companyId': 'comp_apex',
                'senderId': 'user_comp_admin_2',
                'senderName': 'Priya Sharma',
                'senderRole': 'company_admin',
                'senderAvatar': '',
                'text': 'Welcome to Batch Gamma HealthTech AI workspace! Please share your test clinical datasets.',
                'timestamp': '09:00 AM',
                'status': 'read',
            },
            {
                'id': 'msg_g02',
                'batchId': 'batch_gamma',
                'companyId': 'comp_apex',
                'senderId': 'user_client_4',
                'senderName': 'Dr. Raymond Scott',
                'senderRole': 'client',
                'senderAvatar': '',
                'text': 'Hello Priya, BioCare Health team has uploaded the HIPAA telemetry sample in Resources.',
                'timestamp': '09:15 AM',
                'status': 'read',
            },
        ]

    seeded_count = 0
    for item in initial_items:
        m_id = item.get('id') or f"msg_{int(time.time() * 1000)}"
        if not ChatMessage.objects.filter(pk=m_id).exists():
            ChatMessage.objects.create(
                id=m_id,
                batch_id=item.get('batchId') or item.get('batch_id', 'batch_alpha'),
                company_id=item.get('companyId') or item.get('company_id', ''),
                sender_id=item.get('senderId') or item.get('sender_id', ''),
                sender_name=item.get('senderName') or item.get('sender_name', 'Anonymous'),
                sender_role=item.get('senderRole') or item.get('sender_role', 'client'),
                sender_avatar=item.get('senderAvatar') or item.get('sender_avatar', ''),
                recipient_id=item.get('recipientId') or item.get('recipient_id') or None,
                text=item.get('text', ''),
                timestamp=item.get('timestamp') or datetime.now().strftime('%I:%M %p'),
                status=item.get('status', 'read'),
                attachment=item.get('attachment', {}),
                attachments=item.get('attachments', []),
                reactions=item.get('reactions', {}),
            )
            seeded_count += 1

    return Response({'message': f'Successfully seeded {seeded_count} Chat Messages into database.'})


# ============================================================================
# DELIVERABLE RESOURCES & FILE / LINK UPLOAD ENDPOINTS (PostgreSQL Backed)
# ============================================================================

INITIAL_DELIVERABLE_RESOURCES = [
    {
        'id': 'res_01',
        'batch_id': 'batch_alpha',
        'company_id': 'comp_acme',
        'title': 'Enterprise Architecture & Data Flow Diagram v2.4',
        'description': 'Comprehensive system architecture illustrating microservice orchestration, Redis caching layers, and end-to-end encryption.',
        'uploader_id': 'user_worker_1',
        'uploader_name': 'Alex Rivera',
        'uploader_role': 'work_user',
        'file_type': 'PDF Document',
        'file_size': '4.8 MB',
        'file_name': 'Enterprise_Architecture_v2.4.pdf',
        'file_url': '#',
        'external_link': 'https://docs.google.com/document/d/1exampleArchitectureOverview',
        'reviews': [
            {
                'id': 'rev_01',
                'resourceId': 'res_01',
                'reviewerId': 'user_client_1',
                'reviewerName': 'Sarah Jenkins',
                'reviewerRole': 'client',
                'rating': 5,
                'feedback': 'Incredibly detailed and clear. Approved without revisions for our infrastructure committee.',
                'createdAt': '2026-10-04 15:40',
            },
            {
                'id': 'rev_02',
                'resourceId': 'res_01',
                'reviewerId': 'user_client_2',
                'reviewerName': 'David K. Miller',
                'reviewerRole': 'client',
                'rating': 4,
                'feedback': 'Very thorough diagram. Could benefit from an extra paragraph on Disaster Recovery RTO.',
                'createdAt': '2026-10-05 09:12',
            },
        ],
    },
    {
        'id': 'res_02',
        'batch_id': 'batch_alpha',
        'company_id': 'comp_acme',
        'title': 'Q3 Security Penetration Testing & SOC2 Compliance Report',
        'description': 'Third-party audited cybersecurity evaluation with vulnerability scoring and zero active CVEs found.',
        'uploader_id': 'user_worker_2',
        'uploader_name': 'Maya Lin',
        'uploader_role': 'work_user',
        'file_type': 'PDF Document',
        'file_size': '7.2 MB',
        'file_name': 'SOC2_Security_Audit_Report.pdf',
        'file_url': '#',
        'external_link': 'https://drive.google.com/file/d/1exampleSecurityAuditReport',
        'reviews': [
            {
                'id': 'rev_03',
                'resourceId': 'res_02',
                'reviewerId': 'user_client_1',
                'reviewerName': 'Sarah Jenkins',
                'reviewerRole': 'client',
                'rating': 5,
                'feedback': 'Clean bill of health. Our board accepted this report unanimously.',
                'createdAt': '2026-10-04 09:00',
            },
        ],
    },
    {
        'id': 'res_03',
        'batch_id': 'batch_alpha',
        'company_id': 'comp_acme',
        'title': 'Client Integration Handbook & REST API Specification',
        'description': 'Developer documentation for Globex engineers with authentication headers, rate limits, and webhook examples.',
        'uploader_id': 'user_comp_admin_1',
        'uploader_name': 'Marcus Sterling',
        'uploader_role': 'company_admin',
        'file_type': 'ZIP Archive',
        'file_size': '12.5 MB',
        'file_name': 'Client_Integration_API_Spec.zip',
        'file_url': '#',
        'external_link': 'https://github.com/acme-org/client-integration-kit',
        'reviews': [],
    },
    {
        'id': 'res_04',
        'batch_id': 'batch_alpha',
        'company_id': 'comp_acme',
        'title': 'Weekly Sprint 24 Milestone Progress Presentation',
        'description': 'Executive slides highlighting velocity, remaining backlog tickets, and planned Q4 rollouts.',
        'uploader_id': 'user_worker_1',
        'uploader_name': 'Alex Rivera',
        'uploader_role': 'work_user',
        'file_type': 'PowerPoint PPTX',
        'file_size': '6.1 MB',
        'file_name': 'Sprint_24_Milestone_Progress.pptx',
        'file_url': '#',
        'external_link': '',
        'reviews': [
            {
                'id': 'rev_04',
                'resourceId': 'res_04',
                'reviewerId': 'user_client_2',
                'reviewerName': 'David K. Miller',
                'reviewerRole': 'client',
                'rating': 5,
                'feedback': 'Concise, on point, and demonstrates reliable sprint completion.',
                'createdAt': '2026-10-02 11:30',
            },
        ],
    },
    {
        'id': 'res_05',
        'batch_id': 'batch_beta',
        'company_id': 'comp_acme',
        'title': 'Cross-Border Customs API & Webhook Specifications v3.1',
        'description': 'Technical integration manual detailing automated customs clearance triggers, webhook payload schemas, and HMAC validation.',
        'uploader_id': 'user_worker_1',
        'uploader_name': 'Alex Rivera',
        'uploader_role': 'work_user',
        'file_type': 'PDF Document',
        'file_size': '5.4 MB',
        'file_name': 'Customs_API_Webhook_v3.1.pdf',
        'file_url': '#',
        'external_link': 'https://figma.com/file/exampleCustomsSchema',
        'reviews': [
            {
                'id': 'rev_05',
                'resourceId': 'res_05',
                'reviewerId': 'user_client_3',
                'reviewerName': 'Julian Thorne',
                'reviewerRole': 'client',
                'rating': 5,
                'feedback': 'Very thorough HMAC documentation. Our security architect approved it immediately.',
                'createdAt': '2026-10-04 10:15',
            },
        ],
    },
    {
        'id': 'res_06',
        'batch_id': 'batch_beta',
        'company_id': 'comp_acme',
        'title': 'High-Throughput Video Ingestion SLA & Latency Analysis',
        'description': 'Empirical benchmark report on live video transcode latencies across 12 distributed edge locations with 99.99% uptime validation.',
        'uploader_id': 'user_client_6',
        'uploader_name': 'Marcus Vance',
        'uploader_role': 'client',
        'file_type': 'PDF Document',
        'file_size': '8.1 MB',
        'file_name': 'Video_Latency_Benchmark_Report.pdf',
        'file_url': '#',
        'external_link': '',
        'reviews': [
            {
                'id': 'rev_06',
                'resourceId': 'res_06',
                'reviewerId': 'user_comp_admin_1',
                'reviewerName': 'Marcus Sterling',
                'reviewerRole': 'company_admin',
                'rating': 5,
                'feedback': 'Exceptional latency numbers. This validates our tier-1 SLA commitment.',
                'createdAt': '2026-10-04 15:00',
            },
        ],
    },
]


def auto_seed_resources_if_empty():
    if DeliverableResource.objects.count() == 0:
        for item in INITIAL_DELIVERABLE_RESOURCES:
            DeliverableResource.objects.create(
                id=item['id'],
                batch_id=item['batch_id'],
                company_id=item.get('company_id', 'comp_acme'),
                title=item['title'],
                description=item.get('description', ''),
                uploader_id=item['uploader_id'],
                uploader_name=item['uploader_name'],
                uploader_role=item.get('uploader_role', 'work_user'),
                file_type=item.get('file_type', 'PDF Document'),
                file_size=item.get('file_size', '3.5 MB'),
                file_name=item.get('file_name', ''),
                file_url=item.get('file_url', '#'),
                external_link=item.get('external_link', ''),
                reviews=item.get('reviews', []),
            )


@api_view(['GET', 'POST'])
def deliverable_resources_list_create(request):
    """
    GET: List all deliverable resources, optionally filtered by batchId or companyId.
         Auto-seeds initial resources if database is empty.
    POST: Create a new deliverable resource with file and/or external link, broadcast SSE.
    """
    auto_seed_resources_if_empty()

    if request.method == 'GET':
        qs = DeliverableResource.objects.all().order_by('-created_at')
        batch_id = request.query_params.get('batchId') or request.query_params.get('batch_id')
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)

        serializer = DeliverableResourceSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = DeliverableResourceSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = DeliverableResourceSerializer(instance).data
            # Real-time server push across all connected users (company admin, client, work user)
            broadcast_demo_event('resource_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def deliverable_resource_detail(request, pk):
    """
    GET, PATCH, PUT, DELETE for individual deliverable resource with real-time SSE broadcasts.
    """
    try:
        resource = DeliverableResource.objects.get(pk=pk)
    except DeliverableResource.DoesNotExist:
        return Response({'detail': f'Deliverable resource {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DeliverableResourceSerializer(resource)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = DeliverableResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = DeliverableResourceSerializer(updated).data
            broadcast_demo_event('resource_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        res_data = {'id': pk, 'batchId': resource.batch_id}
        resource.delete()
        broadcast_demo_event('resource_deleted', res_data)
        return Response({'message': f'Resource {pk} deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def deliverable_resource_review(request, pk):
    """
    POST: Submit star rating (1-5 stars) and review feedback for a deliverable resource.
    Body: { "rating": 5, "feedback": "Great work!", "reviewerId": "...", "reviewerName": "...", "reviewerRole": "client" }
    """
    try:
        resource = DeliverableResource.objects.get(pk=pk)
    except DeliverableResource.DoesNotExist:
        return Response({'detail': f'Deliverable resource {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    review_data = request.data
    rating = int(review_data.get('rating', 5))
    feedback = review_data.get('feedback', '')
    reviewer_id = review_data.get('reviewerId') or review_data.get('reviewer_id', '')
    reviewer_name = review_data.get('reviewerName') or review_data.get('reviewer_name', 'Client Reviewer')
    reviewer_role = review_data.get('reviewerRole') or review_data.get('reviewer_role', 'client')

    new_review = {
        'id': f"rev_{int(time.time() * 1000)}",
        'resourceId': pk,
        'reviewerId': reviewer_id,
        'reviewerName': reviewer_name,
        'reviewerRole': reviewer_role,
        'rating': rating,
        'feedback': feedback,
        'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M'),
    }

    current_reviews = list(resource.reviews or [])
    current_reviews.insert(0, new_review)
    resource.reviews = current_reviews
    resource.save()

    data = DeliverableResourceSerializer(resource).data
    broadcast_demo_event('resource_reviewed', {'resourceId': pk, 'review': new_review, 'resource': data})
    broadcast_demo_event('resource_updated', data)
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def deliverable_resource_upload_file(request):
    """
    POST: Upload actual file (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, ZIP, Images, etc.)
    Stores file in media/deliverables/ and returns fileUrl, fileName, fileSize, and detected fileType.
    Supports multipart/form-data or JSON dataUrl.
    """
    import os
    from django.core.files.storage import default_storage

    file_obj = request.FILES.get('file')
    if not file_obj:
        data_url = request.data.get('dataUrl')
        name = request.data.get('name', 'document.pdf')
        size_str = request.data.get('size', '1.5 MB')
        file_type = request.data.get('type', 'PDF Document')
        if data_url:
            return Response({
                'fileName': name,
                'fileUrl': data_url,
                'fileSize': size_str,
                'fileType': file_type,
            })
        return Response({'error': 'No file or dataUrl provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Detect human-friendly file type from extension
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext == '.pdf':
        file_type = 'PDF Document'
    elif ext in ['.doc', '.docx']:
        file_type = 'Word Document (DOCX)'
    elif ext in ['.xls', '.xlsx', '.csv']:
        file_type = 'Spreadsheet / Spec'
    elif ext in ['.ppt', '.pptx']:
        file_type = 'PowerPoint Presentation'
    elif ext in ['.zip', '.rar', '.7z', '.tar', '.gz']:
        file_type = 'Code Archive ZIP'
    elif ext in ['.png', '.jpg', '.jpeg', '.webp', '.svg']:
        file_type = 'Architecture Diagram / Image'
    elif ext in ['.txt', '.md', '.json', '.yaml']:
        file_type = 'Text / Specification'
    elif ext in ['.mp4', '.mov', '.webm', '.avi']:
        file_type = 'Demo Walkthrough Video'
    else:
        file_type = 'Deliverable Document'

    # Compute human-readable size
    size_mb = file_obj.size / (1024 * 1024)
    if size_mb >= 1.0:
        file_size = f"{size_mb:.1f} MB"
    else:
        file_size = f"{max(1, int(file_obj.size / 1024))} KB"

    # Save to media/deliverables/
    clean_name = file_obj.name.replace(' ', '_')
    filename = f"deliverable_{int(time.time() * 1000)}_{clean_name}"
    save_path = os.path.join('deliverables', filename)
    saved_name = default_storage.save(save_path, file_obj)
    rel_url = default_storage.url(saved_name)
    file_url = request.build_absolute_uri(rel_url) if hasattr(request, 'build_absolute_uri') else rel_url

    return Response({
        'fileName': file_obj.name,
        'fileUrl': file_url,
        'fileSize': file_size,
        'fileType': file_type,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def seed_initial_deliverable_resources(request):
    """
    POST: Seed initial realistic deliverable resources if database is empty or on manual trigger.
    """
    seeded_count = 0
    for item in INITIAL_DELIVERABLE_RESOURCES:
        if not DeliverableResource.objects.filter(pk=item['id']).exists():
            DeliverableResource.objects.create(
                id=item['id'],
                batch_id=item['batch_id'],
                company_id=item.get('company_id', 'comp_acme'),
                title=item['title'],
                description=item.get('description', ''),
                uploader_id=item['uploader_id'],
                uploader_name=item['uploader_name'],
                uploader_role=item.get('uploader_role', 'work_user'),
                file_type=item.get('file_type', 'PDF Document'),
                file_size=item.get('file_size', '3.5 MB'),
                file_name=item.get('file_name', ''),
                file_url=item.get('file_url', '#'),
                external_link=item.get('external_link', ''),
                reviews=item.get('reviews', []),
            )
            seeded_count += 1

    return Response({'message': f'Successfully seeded {seeded_count} Deliverable Resources into database.'})


DEFAULT_INTEGRATION_SETTINGS = {
    'id': 'default',
    'ai_provider': 'gemini',
    'model_name': 'gemini-2.5-flash',
    'api_key': 'AIzaSyA4EXAMPLE_MOCK_GEMINI_KEY_2026',
    'whatsapp_enabled_global': True,
    'email_alerts_global': True,
    'demo_whatsapp_number': '+1 (555) 019-2831',
    'company_settings': {
        'comp_acme': {'whatsappEnabled': True, 'emailEnabled': True},
        'comp_apex': {'whatsappEnabled': False, 'emailEnabled': True},
    },
    'client_settings': {
        'client_comp_1': {'whatsappEnabled': True, 'emailEnabled': True},
        'client_comp_2': {'whatsappEnabled': False, 'emailEnabled': True},
        'client_comp_3': {'whatsappEnabled': True, 'emailEnabled': False},
        'client_comp_4': {'whatsappEnabled': True, 'emailEnabled': True},
    },
}

DEFAULT_COMPANY_SETTINGS = {
    'id': 'default',
    'company_id': 'default',
    'allow_chat_with_users': True,
    'whatsapp_alerts_enabled': True,
    'email_alerts_enabled': True,
    'universal_default_password': 'OmniDefault@2026',
}


@api_view(['GET', 'POST', 'PUT', 'PATCH'])
def system_integration_settings_view(request):
    """
    GET: Retrieve system integration settings (AI provider, API key, WhatsApp routing, company/client toggles).
    POST / PUT / PATCH: Update settings, save to PostgreSQL, and broadcast SSE event to all connected clients.
    """
    instance, _ = SystemIntegrationSettings.objects.get_or_create(
        id='default',
        defaults=DEFAULT_INTEGRATION_SETTINGS,
    )

    if request.method == 'GET':
        serializer = SystemIntegrationSettingsSerializer(instance)
        return Response(serializer.data)

    serializer = SystemIntegrationSettingsSerializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        saved_instance = serializer.save()
        out_data = SystemIntegrationSettingsSerializer(saved_instance).data
        broadcast_demo_event('integration_settings_updated', out_data)
        return Response(out_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'PUT', 'PATCH'])
def company_settings_view(request):
    """
    GET: Retrieve company settings (allowChatWithUsers, whatsappAlertsEnabled, emailAlertsEnabled, universalDefaultPassword).
    Supports ?companyId=comp_xxx or defaults to 'default'.
    POST / PUT / PATCH: Update company settings, save to PostgreSQL, and broadcast SSE event to all connected clients in real time.
    """
    company_id = request.query_params.get('companyId') or request.data.get('companyId') or 'default'

    instance = CompanySettingsConfig.objects.filter(company_id=company_id).first()
    if not instance:
        default_inst = CompanySettingsConfig.objects.filter(company_id='default').first()
        instance = CompanySettingsConfig.objects.create(
            id=company_id if company_id != 'default' else 'default',
            company_id=company_id,
            allow_chat_with_users=default_inst.allow_chat_with_users if default_inst else DEFAULT_COMPANY_SETTINGS['allow_chat_with_users'],
            whatsapp_alerts_enabled=default_inst.whatsapp_alerts_enabled if default_inst else DEFAULT_COMPANY_SETTINGS['whatsapp_alerts_enabled'],
            email_alerts_enabled=default_inst.email_alerts_enabled if default_inst else DEFAULT_COMPANY_SETTINGS['email_alerts_enabled'],
            universal_default_password=default_inst.universal_default_password if default_inst else DEFAULT_COMPANY_SETTINGS['universal_default_password'],
        )

    if request.method == 'GET':
        serializer = CompanySettingsConfigSerializer(instance)
        data = serializer.data
        data['companyId'] = company_id
        return Response(data)

    serializer = CompanySettingsConfigSerializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        saved_instance = serializer.save()
        out_data = CompanySettingsConfigSerializer(saved_instance).data
        out_data['companyId'] = company_id

        # Also sync CompanyOrganization in PostgreSQL if company_id corresponds to an organization
        if company_id != 'default':
            org = CompanyOrganization.objects.filter(id=company_id).first()
            if org:
                dirty = False
                if 'whatsappAlertsEnabled' in request.data or 'whatsapp_alerts_enabled' in request.data:
                    org.whatsapp_enabled = saved_instance.whatsapp_alerts_enabled
                    dirty = True
                if 'emailAlertsEnabled' in request.data or 'email_alerts_enabled' in request.data:
                    org.email_enabled = saved_instance.email_alerts_enabled
                    dirty = True
                if dirty:
                    org.save()
                    broadcast_demo_event('company_organization_updated', CompanyOrganizationSerializer(org).data)

        broadcast_demo_event('company_settings_updated', out_data)
        return Response(out_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def batches_list_create(request):
    """
    List all workspace batches or create a new batch.
    Supports filtering by companyId, leadAdminId.
    """
    if request.method == 'GET':
        queryset = WorkspaceBatch.objects.all()
        company_id = request.query_params.get('companyId') or request.query_params.get('company_id')
        lead_admin_id = request.query_params.get('leadAdminId') or request.query_params.get('lead_admin_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if lead_admin_id:
            queryset = queryset.filter(lead_admin_id=lead_admin_id)
        serializer = WorkspaceBatchSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WorkspaceBatchSerializer(data=request.data)
        if serializer.is_valid():
            batch = serializer.save()
            # If lead_admin_id is provided, sync into WorkspaceUser's batch_ids
            if batch.lead_admin_id:
                try:
                    admin_user = WorkspaceUser.objects.filter(id=batch.lead_admin_id).first()
                    if admin_user:
                        b_ids = admin_user.batch_ids if isinstance(admin_user.batch_ids, list) else []
                        if batch.id not in b_ids:
                            admin_user.batch_ids = b_ids + [batch.id]
                            admin_user.save()
                            broadcast_demo_event('user_updated', WorkspaceUserSerializer(admin_user).data)
                except Exception as e:
                    print(f"Error syncing batch to admin user: {e}")
            # If company_id is provided, increment total_batches in CompanyOrganization
            if batch.company_id:
                try:
                    comp_org = CompanyOrganization.objects.filter(id=batch.company_id).first()
                    if comp_org:
                        comp_org.total_batches = WorkspaceBatch.objects.filter(company_id=batch.company_id).count()
                        comp_org.save()
                        broadcast_demo_event('company_organization_updated', CompanyOrganizationSerializer(comp_org).data)
                except Exception as e:
                    print(f"Error updating company total_batches: {e}")

            data = WorkspaceBatchSerializer(batch).data
            broadcast_demo_event('batch_created', data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
def batch_detail(request, pk):
    """
    Retrieve, update or delete a workspace batch.
    """
    try:
        instance = WorkspaceBatch.objects.get(pk=pk)
    except WorkspaceBatch.DoesNotExist:
        return Response({'detail': f'Batch {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = WorkspaceBatchSerializer(instance)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        serializer = WorkspaceBatchSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            data = WorkspaceBatchSerializer(updated).data
            broadcast_demo_event('batch_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        data = {'id': pk, 'name': instance.name, 'companyId': instance.company_id}
        comp_id = instance.company_id
        instance.delete()
        if comp_id:
            try:
                comp_org = CompanyOrganization.objects.filter(id=comp_id).first()
                if comp_org:
                    comp_org.total_batches = WorkspaceBatch.objects.filter(company_id=comp_id).count()
                    comp_org.save()
                    broadcast_demo_event('company_organization_updated', CompanyOrganizationSerializer(comp_org).data)
            except Exception:
                pass
        broadcast_demo_event('batch_deleted', data)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def seed_initial_batches(request):
    """
    Seed initial workspace batches (Batch Alpha, Batch Beta, Batch Gamma) into PostgreSQL.
    """
    initial_data = [
        {
            'id': 'batch_alpha',
            'name': 'Batch Alpha - Enterprise Transformation',
            'code': 'BAT-2026-A',
            'company_id': 'comp_acme',
            'description': 'High-velocity cloud migration and real-time data sync program for tier-1 enterprise partners.',
            'client_count': 4,
            'worker_count': 6,
            'start_date': '2026-01-10',
            'status': 'active',
            'lead_admin_id': 'user_comp_admin_1',
        },
        {
            'id': 'batch_beta',
            'name': 'Batch Beta - Logistics Automation',
            'code': 'BAT-2026-B',
            'company_id': 'comp_acme',
            'description': 'Warehouse execution system modernization, mobile scanning, and client supply chain bridge.',
            'client_count': 3,
            'worker_count': 5,
            'start_date': '2026-02-01',
            'status': 'active',
            'lead_admin_id': 'user_comp_admin_1',
        },
        {
            'id': 'batch_gamma',
            'name': 'Batch Gamma - HealthTech AI Pipelines',
            'code': 'BAT-2026-G',
            'company_id': 'comp_apex',
            'description': 'HIPAA compliant analytics processing pipelines and real-time clinical review dashboard.',
            'client_count': 2,
            'worker_count': 4,
            'start_date': '2026-03-01',
            'status': 'active',
            'lead_admin_id': 'user_comp_admin_2',
        },
    ]

    created_count = 0
    for item in initial_data:
        _, created = WorkspaceBatch.objects.update_or_create(
            id=item['id'],
            defaults=item,
        )
        if created:
            created_count += 1

    batches = WorkspaceBatch.objects.all()
    serializer = WorkspaceBatchSerializer(batches, many=True)
    return Response({
        'status': 'success',
        'created_count': created_count,
        'total_batches': batches.count(),
        'batches': serializer.data,
    })





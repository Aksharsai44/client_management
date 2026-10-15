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
)
from .serializers import (
    DemoRequestSerializer,
    PricingPlanSerializer,
    CompanyOrganizationSerializer,
    ProductAdminUserSerializer,
    ClientCompanySerializer,
    WorkspaceUserSerializer,
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
            data = CompanyOrganizationSerializer(updated).data
            broadcast_demo_event('company_organization_updated', data)
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instance.delete()
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
            'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
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
            'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
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



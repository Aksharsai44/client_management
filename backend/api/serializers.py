from rest_framework import serializers
from .models import DemoRequest, PricingPlan, CompanyOrganization, ProductAdminUser, ClientCompany, WorkspaceUser

class DemoRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    companyName = serializers.CharField(source='company_name', required=False)
    teamSize = serializers.CharField(source='team_size', required=False, default='10-25 members')
    submittedAt = serializers.CharField(source='submitted_at', required=False)
    dummyCredential = serializers.JSONField(source='dummy_credential', required=False, allow_null=True)

    class Meta:
        model = DemoRequest
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'companyName',
            'teamSize',
            'requirements',
            'submittedAt',
            'status',
            'dummyCredential',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_internal_value(self, data):
        # Support both camelCase and snake_case input
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyName' in mutable_data and 'company_name' not in mutable_data:
            mutable_data['company_name'] = mutable_data['companyName']
        if 'teamSize' in mutable_data and 'team_size' not in mutable_data:
            mutable_data['team_size'] = mutable_data['teamSize']
        if 'submittedAt' in mutable_data and 'submitted_at' not in mutable_data:
            mutable_data['submitted_at'] = mutable_data['submittedAt']
        if 'dummyCredential' in mutable_data and 'dummy_credential' not in mutable_data:
            mutable_data['dummy_credential'] = mutable_data['dummyCredential']
        return super().to_internal_value(mutable_data)


class PricingPlanSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    monthlyPrice = serializers.FloatField(source='monthly_price', required=False)
    yearlyPrice = serializers.FloatField(source='yearly_price', required=False)
    currency = serializers.CharField(required=False, default='INR')
    currencySymbol = serializers.CharField(source='currency_symbol', required=False, default='₹')
    maxUsers = serializers.IntegerField(source='max_users', required=False, default=100)
    maxClients = serializers.IntegerField(source='max_clients', required=False, default=20)
    whatsAppIntegration = serializers.BooleanField(source='whatsapp_integration', required=False, default=True)
    emailAlerts = serializers.BooleanField(source='email_alerts', required=False, default=True)
    aiTranscripts = serializers.BooleanField(source='ai_transcripts', required=False, default=False)
    customBranding = serializers.BooleanField(source='custom_branding', required=False, default=False)

    class Meta:
        model = PricingPlan
        fields = [
            'id',
            'name',
            'tagline',
            'monthlyPrice',
            'yearlyPrice',
            'currency',
            'currencySymbol',
            'popular',
            'features',
            'maxUsers',
            'maxClients',
            'whatsAppIntegration',
            'emailAlerts',
            'aiTranscripts',
            'customBranding',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'monthlyPrice' in mutable_data and 'monthly_price' not in mutable_data:
            mutable_data['monthly_price'] = mutable_data['monthlyPrice']
        if 'yearlyPrice' in mutable_data and 'yearly_price' not in mutable_data:
            mutable_data['yearly_price'] = mutable_data['yearlyPrice']
        if 'currencySymbol' in mutable_data and 'currency_symbol' not in mutable_data:
            mutable_data['currency_symbol'] = mutable_data['currencySymbol']
        if 'maxUsers' in mutable_data and 'max_users' not in mutable_data:
            mutable_data['max_users'] = mutable_data['maxUsers']
        if 'maxClients' in mutable_data and 'max_clients' not in mutable_data:
            mutable_data['max_clients'] = mutable_data['maxClients']
        if 'whatsAppIntegration' in mutable_data and 'whatsapp_integration' not in mutable_data:
            mutable_data['whatsapp_integration'] = mutable_data['whatsAppIntegration']
        if 'emailAlerts' in mutable_data and 'email_alerts' not in mutable_data:
            mutable_data['email_alerts'] = mutable_data['emailAlerts']
        if 'aiTranscripts' in mutable_data and 'ai_transcripts' not in mutable_data:
            mutable_data['ai_transcripts'] = mutable_data['aiTranscripts']
        if 'customBranding' in mutable_data and 'custom_branding' not in mutable_data:
            mutable_data['custom_branding'] = mutable_data['customBranding']
        return super().to_internal_value(mutable_data)


class CompanyOrganizationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    companyAdminId = serializers.CharField(source='id', required=False)
    companyName = serializers.CharField(source='company_name')
    adminName = serializers.CharField(source='admin_name')
    adminEmail = serializers.EmailField(source='admin_email')
    password = serializers.CharField(required=False, default='OrgDefault@2026')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    website = serializers.CharField(required=False, allow_blank=True, default='')
    industry = serializers.CharField(required=False, default='Enterprise Software & Logistics')
    tier = serializers.CharField(required=False, default='Enterprise')
    status = serializers.CharField(required=False, default='active')
    totalClients = serializers.IntegerField(source='total_clients', required=False, default=0)
    totalUsers = serializers.IntegerField(source='total_users', required=False, default=1)
    totalBatches = serializers.IntegerField(source='total_batches', required=False, default=0)
    activeMeetingsCount = serializers.IntegerField(source='active_meetings_count', required=False, default=0)
    storageUsedMb = serializers.FloatField(source='storage_used_mb', required=False, default=0)
    whatsappEnabled = serializers.BooleanField(source='whatsapp_enabled', required=False, default=True)
    emailEnabled = serializers.BooleanField(source='email_enabled', required=False, default=True)
    createdAt = serializers.DateTimeField(source='created_at', required=False, read_only=True)

    class Meta:
        model = CompanyOrganization
        fields = [
            'id',
            'companyAdminId',
            'companyName',
            'adminName',
            'adminEmail',
            'password',
            'phone',
            'website',
            'industry',
            'tier',
            'status',
            'totalClients',
            'totalUsers',
            'totalBatches',
            'activeMeetingsCount',
            'storageUsedMb',
            'whatsappEnabled',
            'emailEnabled',
            'createdAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyAdminId' in mutable_data and 'id' not in mutable_data:
            mutable_data['id'] = mutable_data['companyAdminId']
        elif 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"user_comp_admin_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class ProductAdminUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(required=False, default='AdminPass#2026')
    role = serializers.CharField(required=False, default='product_admin')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    designation = serializers.CharField(required=False, allow_blank=True, default='Product Administrator')
    assignedCompanyAdminIds = serializers.ListField(
        child=serializers.CharField(),
        source='assigned_company_admin_ids',
        required=False,
        default=list
    )
    status = serializers.CharField(required=False, default='active')
    createdAt = serializers.DateTimeField(source='created_at', required=False, read_only=True)

    class Meta:
        model = ProductAdminUser
        fields = [
            'id',
            'name',
            'email',
            'password',
            'role',
            'phone',
            'designation',
            'assignedCompanyAdminIds',
            'status',
            'createdAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"user_padmin_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class ClientCompanySerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    name = serializers.CharField()
    clientName = serializers.CharField(source='client_name', required=False)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    websiteUrl = serializers.CharField(source='website_url', required=False, allow_blank=True, default='')
    documents = serializers.JSONField(required=False, default=list)
    batchId = serializers.CharField(source='batch_id', required=False, allow_blank=True, default='batch_alpha')
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True, default='')
    status = serializers.CharField(required=False, default='active')
    createdAt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClientCompany
        fields = [
            'id',
            'name',
            'clientName',
            'email',
            'phone',
            'description',
            'websiteUrl',
            'documents',
            'batchId',
            'companyId',
            'status',
            'createdAt',
        ]

    def get_createdAt(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d')
        import datetime
        return datetime.date.today().strftime('%Y-%m-%d')

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'clientName' in mutable_data and 'client_name' not in mutable_data:
            mutable_data['client_name'] = mutable_data['clientName']
        if 'websiteUrl' in mutable_data and 'website_url' not in mutable_data:
            mutable_data['website_url'] = mutable_data['websiteUrl']
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if not mutable_data.get('batch_id'):
            mutable_data['batch_id'] = 'batch_alpha'
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"client_comp_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class WorkspaceUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField(required=False, default='work_user')
    password = serializers.CharField(required=False, allow_blank=True, default='Pass#2026')
    avatar = serializers.CharField(required=False, allow_blank=True, default='')
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True, default='')
    companyName = serializers.CharField(source='company_name', required=False, allow_blank=True, default='')
    batchIds = serializers.ListField(
        child=serializers.CharField(),
        source='batch_ids',
        required=False,
        default=list
    )
    status = serializers.CharField(required=False, default='active')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    designation = serializers.CharField(required=False, allow_blank=True, default='')
    joinedDate = serializers.CharField(source='joined_date', required=False, allow_blank=True, default='')
    assignedCompanyAdminIds = serializers.ListField(
        child=serializers.CharField(),
        source='assigned_company_admin_ids',
        required=False,
        default=list
    )

    class Meta:
        model = WorkspaceUser
        fields = [
            'id',
            'name',
            'email',
            'role',
            'password',
            'avatar',
            'companyId',
            'companyName',
            'batchIds',
            'status',
            'phone',
            'designation',
            'joinedDate',
            'assignedCompanyAdminIds',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'companyName' in mutable_data and 'company_name' not in mutable_data:
            mutable_data['company_name'] = mutable_data['companyName']
        if 'batchIds' in mutable_data and 'batch_ids' not in mutable_data:
            mutable_data['batch_ids'] = mutable_data['batchIds']
        if 'batch_ids' in mutable_data and isinstance(mutable_data['batch_ids'], list):
            mutable_data['batch_ids'] = [b for b in mutable_data['batch_ids'] if b]
        if not mutable_data.get('batch_ids'):
            mutable_data['batch_ids'] = ['batch_alpha']
        if 'joinedDate' in mutable_data and 'joined_date' not in mutable_data:
            mutable_data['joined_date'] = mutable_data['joinedDate']
        if 'assignedCompanyAdminIds' in mutable_data and 'assigned_company_admin_ids' not in mutable_data:
            mutable_data['assigned_company_admin_ids'] = mutable_data['assignedCompanyAdminIds']
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"user_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)



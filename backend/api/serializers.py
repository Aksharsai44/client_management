from rest_framework import serializers
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
    Meeting,
    AttendanceRecord,
)

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
    bankName = serializers.CharField(source='bank_name', required=False, allow_blank=True, default='HDFC Bank')
    accountHolderName = serializers.CharField(source='account_holder_name', required=False, allow_blank=True, default='')
    accountNumber = serializers.CharField(source='account_number', required=False, allow_blank=True, default='')
    ifscCode = serializers.CharField(source='ifsc_code', required=False, allow_blank=True, default='')
    accountType = serializers.CharField(source='account_type', required=False, default='Current Account')
    upiId = serializers.CharField(source='upi_id', required=False, allow_blank=True, default='')
    qrCodeUrl = serializers.CharField(source='qr_code_url', required=False, allow_blank=True, default='')
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
            'bankName',
            'accountHolderName',
            'accountNumber',
            'ifscCode',
            'accountType',
            'upiId',
            'qrCodeUrl',
            'createdAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyAdminId' in mutable_data and 'id' not in mutable_data:
            mutable_data['id'] = mutable_data['companyAdminId']
        elif 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"user_comp_admin_{int(time.time() * 1000)}"
        if 'bankName' in mutable_data and 'bank_name' not in mutable_data:
            mutable_data['bank_name'] = mutable_data['bankName']
        if 'accountHolderName' in mutable_data and 'account_holder_name' not in mutable_data:
            mutable_data['account_holder_name'] = mutable_data['accountHolderName']
        if 'accountNumber' in mutable_data and 'account_number' not in mutable_data:
            mutable_data['account_number'] = mutable_data['accountNumber']
        if 'ifscCode' in mutable_data and 'ifsc_code' not in mutable_data:
            mutable_data['ifsc_code'] = mutable_data['ifscCode']
        if 'accountType' in mutable_data and 'account_type' not in mutable_data:
            mutable_data['account_type'] = mutable_data['accountType']
        if 'upiId' in mutable_data and 'upi_id' not in mutable_data:
            mutable_data['upi_id'] = mutable_data['upiId']
        if 'qrCodeUrl' in mutable_data and 'qr_code_url' not in mutable_data:
            mutable_data['qr_code_url'] = mutable_data['qrCodeUrl']
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
    portfolioUrl = serializers.CharField(source='portfolio_url', required=False, allow_blank=True, default='')

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
            'linkedin',
            'github',
            'portfolioUrl',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'companyName' in mutable_data and 'company_name' not in mutable_data:
            mutable_data['company_name'] = mutable_data['companyName']
        if 'portfolioUrl' in mutable_data and 'portfolio_url' not in mutable_data:
            mutable_data['portfolio_url'] = mutable_data['portfolioUrl']
        if 'batchIds' in mutable_data and 'batch_ids' not in mutable_data:
            mutable_data['batch_ids'] = mutable_data['batchIds']
        if 'batch_ids' in mutable_data and isinstance(mutable_data['batch_ids'], list):
            mutable_data['batch_ids'] = [b for b in mutable_data['batch_ids'] if b]
        if 'batch_ids' not in mutable_data or not mutable_data.get('batch_ids'):
            if self.instance and self.instance.batch_ids:
                mutable_data['batch_ids'] = self.instance.batch_ids
            else:
                mutable_data['batch_ids'] = ['batch_alpha']
        if 'joinedDate' in mutable_data and 'joined_date' not in mutable_data:
            mutable_data['joined_date'] = mutable_data['joinedDate']
        if 'assignedCompanyAdminIds' in mutable_data and 'assigned_company_admin_ids' not in mutable_data:
            mutable_data['assigned_company_admin_ids'] = mutable_data['assignedCompanyAdminIds']
        if self.instance and self.instance.id:
            mutable_data['id'] = self.instance.id
        elif 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"user_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class ProjectMOUSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    companyId = serializers.CharField(source='company_id', required=False, default='comp_acme')
    clientCompanyId = serializers.CharField(source='client_company_id', required=False, allow_blank=True, default='')
    clientName = serializers.CharField(source='client_name', required=False, allow_blank=True, default='')
    clientEmail = serializers.EmailField(source='client_email', required=False, allow_blank=True, default='')
    projectTitle = serializers.CharField(source='project_title')
    totalAmount = serializers.FloatField(source='total_amount', required=False, default=0.0)
    monthlyAmount = serializers.FloatField(source='monthly_amount', required=False, default=0.0)
    currencySymbol = serializers.CharField(source='currency_symbol', required=False, default='₹')
    billingFrequency = serializers.CharField(source='billing_frequency', required=False, default='monthly')
    billingDayOfMonth = serializers.IntegerField(source='billing_day_of_month', required=False, default=5)
    startDate = serializers.CharField(source='start_date', required=False, allow_blank=True, default='')
    endDate = serializers.CharField(source='end_date', required=False, allow_blank=True, default='')
    mouTerms = serializers.CharField(source='mou_terms', required=False, allow_blank=True, default='')
    signedDate = serializers.CharField(source='signed_date', required=False, allow_blank=True, default='')
    createdAt = serializers.SerializerMethodField(read_only=True)
    updatedAt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectMOU
        fields = [
            'id',
            'companyId',
            'clientCompanyId',
            'clientName',
            'clientEmail',
            'projectTitle',
            'description',
            'totalAmount',
            'monthlyAmount',
            'currency',
            'currencySymbol',
            'billingFrequency',
            'billingDayOfMonth',
            'startDate',
            'endDate',
            'status',
            'mouTerms',
            'signedDate',
            'createdAt',
            'updatedAt',
        ]

    def get_createdAt(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def get_updatedAt(self, obj):
        if obj.updated_at:
            return obj.updated_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'clientCompanyId' in mutable_data and 'client_company_id' not in mutable_data:
            mutable_data['client_company_id'] = mutable_data['clientCompanyId']
        if 'clientName' in mutable_data and 'client_name' not in mutable_data:
            mutable_data['client_name'] = mutable_data['clientName']
        if 'clientEmail' in mutable_data and 'client_email' not in mutable_data:
            mutable_data['client_email'] = mutable_data['clientEmail']
        if 'projectTitle' in mutable_data and 'project_title' not in mutable_data:
            mutable_data['project_title'] = mutable_data['projectTitle']
        if 'totalAmount' in mutable_data and 'total_amount' not in mutable_data:
            mutable_data['total_amount'] = mutable_data['totalAmount']
        if 'monthlyAmount' in mutable_data and 'monthly_amount' not in mutable_data:
            mutable_data['monthly_amount'] = mutable_data['monthlyAmount']
        if 'currencySymbol' in mutable_data and 'currency_symbol' not in mutable_data:
            mutable_data['currency_symbol'] = mutable_data['currencySymbol']
        if 'billingFrequency' in mutable_data and 'billing_frequency' not in mutable_data:
            mutable_data['billing_frequency'] = mutable_data['billingFrequency']
        if 'billingDayOfMonth' in mutable_data and 'billing_day_of_month' not in mutable_data:
            mutable_data['billing_day_of_month'] = mutable_data['billingDayOfMonth']
        if 'startDate' in mutable_data and 'start_date' not in mutable_data:
            mutable_data['start_date'] = mutable_data['startDate']
        if 'endDate' in mutable_data and 'end_date' not in mutable_data:
            mutable_data['end_date'] = mutable_data['endDate']
        if 'mouTerms' in mutable_data and 'mou_terms' not in mutable_data:
            mutable_data['mou_terms'] = mutable_data['mouTerms']
        if 'signedDate' in mutable_data and 'signed_date' not in mutable_data:
            mutable_data['signed_date'] = mutable_data['signedDate']
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"mou_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class PaymentRecordSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    projectMouId = serializers.CharField(source='project_mou_id', required=False, allow_blank=True, default='')
    companyId = serializers.CharField(source='company_id', required=False, default='comp_acme')
    clientCompanyId = serializers.CharField(source='client_company_id', required=False, allow_blank=True, default='')
    clientName = serializers.CharField(source='client_name', required=False, allow_blank=True, default='')
    clientEmail = serializers.EmailField(source='client_email', required=False, allow_blank=True, default='')
    invoiceNumber = serializers.CharField(source='invoice_number', required=False, allow_blank=True, default='')
    billingMonth = serializers.CharField(source='billing_month', required=False, default='')
    currencySymbol = serializers.CharField(source='currency_symbol', required=False, default='₹')
    dueDate = serializers.CharField(source='due_date', required=False, allow_blank=True, default='')
    paidDate = serializers.CharField(source='paid_date', required=False, allow_blank=True, default='')
    paymentMethod = serializers.CharField(source='payment_method', required=False, allow_blank=True, default='')
    transactionReference = serializers.CharField(source='transaction_reference', required=False, allow_blank=True, default='')
    receiptUrl = serializers.CharField(source='receipt_url', required=False, allow_blank=True, default='')
    reminderSent = serializers.BooleanField(source='reminder_sent', required=False, default=False)
    reminderSentAt = serializers.CharField(source='reminder_sent_at', required=False, allow_blank=True, default='')
    createdAt = serializers.SerializerMethodField(read_only=True)
    updatedAt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PaymentRecord
        fields = [
            'id',
            'projectMouId',
            'companyId',
            'clientCompanyId',
            'clientName',
            'clientEmail',
            'title',
            'invoiceNumber',
            'billingMonth',
            'amount',
            'currency',
            'currencySymbol',
            'dueDate',
            'status',
            'paidDate',
            'paymentMethod',
            'transactionReference',
            'notes',
            'receiptUrl',
            'reminderSent',
            'reminderSentAt',
            'createdAt',
            'updatedAt',
        ]

    def get_createdAt(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def get_updatedAt(self, obj):
        if obj.updated_at:
            return obj.updated_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'projectMouId' in mutable_data and 'project_mou_id' not in mutable_data:
            mutable_data['project_mou_id'] = mutable_data['projectMouId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'clientCompanyId' in mutable_data and 'client_company_id' not in mutable_data:
            mutable_data['client_company_id'] = mutable_data['clientCompanyId']
        if 'clientName' in mutable_data and 'client_name' not in mutable_data:
            mutable_data['client_name'] = mutable_data['clientName']
        if 'clientEmail' in mutable_data and 'client_email' not in mutable_data:
            mutable_data['client_email'] = mutable_data['clientEmail']
        if 'invoiceNumber' in mutable_data and 'invoice_number' not in mutable_data:
            mutable_data['invoice_number'] = mutable_data['invoiceNumber']
        if 'billingMonth' in mutable_data and 'billing_month' not in mutable_data:
            mutable_data['billing_month'] = mutable_data['billingMonth']
        if 'currencySymbol' in mutable_data and 'currency_symbol' not in mutable_data:
            mutable_data['currency_symbol'] = mutable_data['currencySymbol']
        if 'dueDate' in mutable_data and 'due_date' not in mutable_data:
            mutable_data['due_date'] = mutable_data['dueDate']
        if 'paidDate' in mutable_data and 'paid_date' not in mutable_data:
            mutable_data['paid_date'] = mutable_data['paidDate']
        if 'paymentMethod' in mutable_data and 'payment_method' not in mutable_data:
            mutable_data['payment_method'] = mutable_data['paymentMethod']
        if 'transactionReference' in mutable_data and 'transaction_reference' not in mutable_data:
            mutable_data['transaction_reference'] = mutable_data['transactionReference']
        if 'receiptUrl' in mutable_data and 'receipt_url' not in mutable_data:
            mutable_data['receipt_url'] = mutable_data['receiptUrl']
        if 'reminderSent' in mutable_data and 'reminder_sent' not in mutable_data:
            mutable_data['reminder_sent'] = mutable_data['reminderSent']
        if 'reminderSentAt' in mutable_data and 'reminder_sent_at' not in mutable_data:
            mutable_data['reminder_sent_at'] = mutable_data['reminderSentAt']
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"pay_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class CommunityPostSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch_id')
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True, default='')
    authorId = serializers.CharField(source='author_id')
    authorName = serializers.CharField(source='author_name')
    authorRole = serializers.CharField(source='author_role', required=False, default='client')
    authorAvatar = serializers.CharField(source='author_avatar', required=False, allow_blank=True, default='')
    attachmentUrl = serializers.CharField(source='attachment_url', required=False, allow_blank=True, default='')
    likedBy = serializers.ListField(child=serializers.CharField(), source='liked_by', required=False, default=list)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    replies = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    attachments = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    links = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    createdAt = serializers.SerializerMethodField(read_only=True)
    updatedAt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            'id',
            'batchId',
            'companyId',
            'authorId',
            'authorName',
            'authorRole',
            'authorAvatar',
            'title',
            'content',
            'tags',
            'likes',
            'likedBy',
            'replies',
            'attachmentUrl',
            'attachments',
            'links',
            'createdAt',
            'updatedAt',
        ]

    def get_createdAt(self, obj):
        if obj.created_at_display:
            return obj.created_at_display
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def get_updatedAt(self, obj):
        if obj.updated_at:
            return obj.updated_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'authorId' in mutable_data and 'author_id' not in mutable_data:
            mutable_data['author_id'] = mutable_data['authorId']
        if 'authorName' in mutable_data and 'author_name' not in mutable_data:
            mutable_data['author_name'] = mutable_data['authorName']
        if 'authorRole' in mutable_data and 'author_role' not in mutable_data:
            mutable_data['author_role'] = mutable_data['authorRole']
        if 'authorAvatar' in mutable_data and 'author_avatar' not in mutable_data:
            mutable_data['author_avatar'] = mutable_data['authorAvatar']
        if 'attachmentUrl' in mutable_data and 'attachment_url' not in mutable_data:
            mutable_data['attachment_url'] = mutable_data['attachmentUrl']
        if 'likedBy' in mutable_data and 'liked_by' not in mutable_data:
            mutable_data['liked_by'] = mutable_data['likedBy']
        if 'createdAt' in mutable_data and 'created_at_display' not in mutable_data:
            mutable_data['created_at_display'] = mutable_data['createdAt']
        if 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"post_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)


class ChatMessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    batchId = serializers.CharField(source='batch_id')
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True, default='')
    senderId = serializers.CharField(source='sender_id')
    senderName = serializers.CharField(source='sender_name')
    senderRole = serializers.CharField(source='sender_role', required=False, default='client')
    senderAvatar = serializers.CharField(source='sender_avatar', required=False, allow_blank=True, default='')
    recipientId = serializers.CharField(source='recipient_id', required=False, allow_null=True, allow_blank=True)
    text = serializers.CharField(required=False, allow_blank=True, default='')
    timestamp = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, default='delivered')
    attachment = serializers.JSONField(required=False, default=dict)
    attachments = serializers.JSONField(required=False, default=list)
    reactions = serializers.JSONField(required=False, default=dict)
    isEdited = serializers.BooleanField(source='is_edited', required=False, default=False)
    deletedForUserIds = serializers.JSONField(source='deleted_for_user_ids', required=False, default=list)
    createdAt = serializers.DateTimeField(source='created_at', required=False, read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'batchId',
            'companyId',
            'senderId',
            'senderName',
            'senderRole',
            'senderAvatar',
            'recipientId',
            'text',
            'timestamp',
            'status',
            'attachment',
            'attachments',
            'reactions',
            'isEdited',
            'deletedForUserIds',
            'createdAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'senderId' in mutable_data and 'sender_id' not in mutable_data:
            mutable_data['sender_id'] = mutable_data['senderId']
        if 'senderName' in mutable_data and 'sender_name' not in mutable_data:
            mutable_data['sender_name'] = mutable_data['senderName']
        if 'senderRole' in mutable_data and 'sender_role' not in mutable_data:
            mutable_data['sender_role'] = mutable_data['senderRole']
        if 'senderAvatar' in mutable_data and 'sender_avatar' not in mutable_data:
            mutable_data['sender_avatar'] = mutable_data['senderAvatar']
        if 'recipientId' in mutable_data and 'recipient_id' not in mutable_data:
            mutable_data['recipient_id'] = mutable_data['recipientId']
        if 'isEdited' in mutable_data and 'is_edited' not in mutable_data:
            mutable_data['is_edited'] = mutable_data['isEdited']
        if 'deletedForUserIds' in mutable_data and 'deleted_for_user_ids' not in mutable_data:
            mutable_data['deleted_for_user_ids'] = mutable_data['deletedForUserIds']
        if self.instance:
            mutable_data['id'] = self.instance.id
        elif 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"msg_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)

    def update(self, instance, validated_data):
        validated_data.pop('id', None)
        return super().update(instance, validated_data)


class DeliverableResourceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    batchId = serializers.CharField(source='batch_id')
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True, default='')
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True, default='')
    uploaderId = serializers.CharField(source='uploader_id')
    uploaderName = serializers.CharField(source='uploader_name')
    uploaderRole = serializers.CharField(source='uploader_role', required=False, default='work_user')
    fileType = serializers.CharField(source='file_type', required=False, default='PDF Document')
    fileSize = serializers.CharField(source='file_size', required=False, allow_blank=True, default='')
    fileName = serializers.CharField(source='file_name', required=False, allow_blank=True, default='')
    fileUrl = serializers.CharField(source='file_url', required=False, allow_blank=True, default='')
    externalLink = serializers.CharField(source='external_link', required=False, allow_blank=True, default='')
    reviews = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    uploadedAt = serializers.SerializerMethodField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', required=False, read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', required=False, read_only=True)

    class Meta:
        model = DeliverableResource
        fields = [
            'id',
            'batchId',
            'companyId',
            'title',
            'description',
            'uploaderId',
            'uploaderName',
            'uploaderRole',
            'fileType',
            'fileSize',
            'fileName',
            'fileUrl',
            'externalLink',
            'reviews',
            'uploadedAt',
            'createdAt',
            'updatedAt',
        ]

    def get_uploadedAt(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M')
        return ''

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'uploaderId' in mutable_data and 'uploader_id' not in mutable_data:
            mutable_data['uploader_id'] = mutable_data['uploaderId']
        if 'uploaderName' in mutable_data and 'uploader_name' not in mutable_data:
            mutable_data['uploader_name'] = mutable_data['uploaderName']
        if 'uploaderRole' in mutable_data and 'uploader_role' not in mutable_data:
            mutable_data['uploader_role'] = mutable_data['uploaderRole']
        if 'fileType' in mutable_data and 'file_type' not in mutable_data:
            mutable_data['file_type'] = mutable_data['fileType']
        if 'fileSize' in mutable_data and 'file_size' not in mutable_data:
            mutable_data['file_size'] = mutable_data['fileSize']
        if 'fileName' in mutable_data and 'file_name' not in mutable_data:
            mutable_data['file_name'] = mutable_data['fileName']
        if 'fileUrl' in mutable_data and 'file_url' not in mutable_data:
            mutable_data['file_url'] = mutable_data['fileUrl']
        if 'externalLink' in mutable_data and 'external_link' not in mutable_data:
            mutable_data['external_link'] = mutable_data['externalLink']
        if self.instance:
            mutable_data['id'] = self.instance.id
        elif 'id' not in mutable_data or not mutable_data['id']:
            import time
            mutable_data['id'] = f"res_{int(time.time() * 1000)}"
        return super().to_internal_value(mutable_data)

    def update(self, instance, validated_data):
        validated_data.pop('id', None)
        return super().update(instance, validated_data)


class SystemIntegrationSettingsSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, default='default')
    aiProvider = serializers.CharField(source='ai_provider', required=False)
    modelName = serializers.CharField(source='model_name', required=False)
    apiKey = serializers.CharField(source='api_key', required=False, allow_blank=True)
    whatsappEnabledGlobal = serializers.BooleanField(source='whatsapp_enabled_global', required=False)
    emailAlertsGlobal = serializers.BooleanField(source='email_alerts_global', required=False)
    demoWhatsappNumber = serializers.CharField(source='demo_whatsapp_number', required=False, allow_blank=True)
    companySettings = serializers.JSONField(source='company_settings', required=False)
    clientSettings = serializers.JSONField(source='client_settings', required=False)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = SystemIntegrationSettings
        fields = [
            'id',
            'aiProvider',
            'modelName',
            'apiKey',
            'whatsappEnabledGlobal',
            'emailAlertsGlobal',
            'demoWhatsappNumber',
            'companySettings',
            'clientSettings',
            'updatedAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'aiProvider' in mutable_data and 'ai_provider' not in mutable_data:
            mutable_data['ai_provider'] = mutable_data['aiProvider']
        if 'modelName' in mutable_data and 'model_name' not in mutable_data:
            mutable_data['model_name'] = mutable_data['modelName']
        if 'apiKey' in mutable_data and 'api_key' not in mutable_data:
            mutable_data['api_key'] = mutable_data['apiKey']
        if 'whatsappEnabledGlobal' in mutable_data and 'whatsapp_enabled_global' not in mutable_data:
            mutable_data['whatsapp_enabled_global'] = mutable_data['whatsappEnabledGlobal']
        if 'emailAlertsGlobal' in mutable_data and 'email_alerts_global' not in mutable_data:
            mutable_data['email_alerts_global'] = mutable_data['emailAlertsGlobal']
        if 'demoWhatsappNumber' in mutable_data and 'demo_whatsapp_number' not in mutable_data:
            mutable_data['demo_whatsapp_number'] = mutable_data['demoWhatsappNumber']
        if 'companySettings' in mutable_data and 'company_settings' not in mutable_data:
            mutable_data['company_settings'] = mutable_data['companySettings']
        if 'clientSettings' in mutable_data and 'client_settings' not in mutable_data:
            mutable_data['client_settings'] = mutable_data['clientSettings']
        if not mutable_data.get('id'):
            mutable_data['id'] = 'default'
        return super().to_internal_value(mutable_data)


class CompanySettingsConfigSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, default='default')
    companyId = serializers.CharField(source='company_id', required=False, default='default')
    allowChatWithUsers = serializers.BooleanField(source='allow_chat_with_users', required=False)
    whatsappAlertsEnabled = serializers.BooleanField(source='whatsapp_alerts_enabled', required=False)
    emailAlertsEnabled = serializers.BooleanField(source='email_alerts_enabled', required=False)
    universalDefaultPassword = serializers.CharField(source='universal_default_password', required=False)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = CompanySettingsConfig
        fields = [
            'id',
            'companyId',
            'allowChatWithUsers',
            'whatsappAlertsEnabled',
            'emailAlertsEnabled',
            'universalDefaultPassword',
            'updatedAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'allowChatWithUsers' in mutable_data and 'allow_chat_with_users' not in mutable_data:
            mutable_data['allow_chat_with_users'] = mutable_data['allowChatWithUsers']
        if 'whatsappAlertsEnabled' in mutable_data and 'whatsapp_alerts_enabled' not in mutable_data:
            mutable_data['whatsapp_alerts_enabled'] = mutable_data['whatsappAlertsEnabled']
        if 'emailAlertsEnabled' in mutable_data and 'email_alerts_enabled' not in mutable_data:
            mutable_data['email_alerts_enabled'] = mutable_data['emailAlertsEnabled']
        if 'universalDefaultPassword' in mutable_data and 'universal_default_password' not in mutable_data:
            mutable_data['universal_default_password'] = mutable_data['universalDefaultPassword']
        if self.instance and self.instance.id:
            mutable_data['id'] = self.instance.id
            if 'company_id' not in mutable_data:
                mutable_data['company_id'] = self.instance.company_id
        elif not mutable_data.get('id'):
            cid = mutable_data.get('company_id', 'default')
            mutable_data['id'] = cid if cid else 'default'
        return super().to_internal_value(mutable_data)


class WorkspaceBatchSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True)
    clientCount = serializers.IntegerField(source='client_count', required=False, default=0)
    workerCount = serializers.IntegerField(source='worker_count', required=False, default=0)
    startDate = serializers.CharField(source='start_date', required=False, allow_blank=True)
    leadAdminId = serializers.CharField(source='lead_admin_id', required=False, allow_blank=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = WorkspaceBatch
        fields = [
            'id',
            'name',
            'code',
            'companyId',
            'description',
            'clientCount',
            'workerCount',
            'startDate',
            'status',
            'leadAdminId',
            'createdAt',
            'updatedAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'clientCount' in mutable_data and 'client_count' not in mutable_data:
            mutable_data['client_count'] = mutable_data['clientCount']
        if 'workerCount' in mutable_data and 'worker_count' not in mutable_data:
            mutable_data['worker_count'] = mutable_data['workerCount']
        if 'startDate' in mutable_data and 'start_date' not in mutable_data:
            mutable_data['start_date'] = mutable_data['startDate']
        if 'leadAdminId' in mutable_data and 'lead_admin_id' not in mutable_data:
            mutable_data['lead_admin_id'] = mutable_data['leadAdminId']
        if self.instance and self.instance.id:
            mutable_data['id'] = self.instance.id
        return super().to_internal_value(mutable_data)


class MeetingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    batchId = serializers.CharField(source='batch_id', required=False)
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True)
    scheduleType = serializers.CharField(source='schedule_type', required=False, default='weekly')
    dateTime = serializers.CharField(source='date_time', required=False)
    durationMinutes = serializers.IntegerField(source='duration_minutes', required=False, default=45)
    meetingUrl = serializers.CharField(source='meeting_url', required=False, allow_blank=True)
    status = serializers.CharField(required=False, default='upcoming')
    hostName = serializers.CharField(source='host_name', required=False, default='Admin')
    hostId = serializers.CharField(source='host_id', required=False, allow_blank=True)
    platform = serializers.CharField(required=False, default='in_app')
    startDate = serializers.CharField(source='start_date', required=False, allow_blank=True)
    endDate = serializers.CharField(source='end_date', required=False, allow_blank=True)
    startTime = serializers.CharField(source='start_time', required=False, allow_blank=True)
    recurringPattern = serializers.CharField(source='recurring_pattern', required=False, allow_blank=True)
    recurringDays = serializers.JSONField(source='recurring_days', required=False)
    repeatMonths = serializers.IntegerField(source='repeat_months', required=False, default=1)
    seriesId = serializers.CharField(source='series_id', required=False, allow_blank=True)
    aiSummary = serializers.JSONField(source='ai_summary', required=False)
    transcript = serializers.JSONField(required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id',
            'batchId',
            'companyId',
            'title',
            'description',
            'scheduleType',
            'dateTime',
            'durationMinutes',
            'meetingUrl',
            'status',
            'hostName',
            'hostId',
            'platform',
            'startDate',
            'endDate',
            'startTime',
            'recurringPattern',
            'recurringDays',
            'repeatMonths',
            'seriesId',
            'aiSummary',
            'transcript',
            'createdAt',
            'updatedAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'scheduleType' in mutable_data and 'schedule_type' not in mutable_data:
            mutable_data['schedule_type'] = mutable_data['scheduleType']
        if 'dateTime' in mutable_data and 'date_time' not in mutable_data:
            mutable_data['date_time'] = mutable_data['dateTime']
        if 'durationMinutes' in mutable_data and 'duration_minutes' not in mutable_data:
            mutable_data['duration_minutes'] = mutable_data['durationMinutes']
        if 'meetingUrl' in mutable_data and 'meeting_url' not in mutable_data:
            mutable_data['meeting_url'] = mutable_data['meetingUrl']
        if 'hostName' in mutable_data and 'host_name' not in mutable_data:
            mutable_data['host_name'] = mutable_data['hostName']
        if 'hostId' in mutable_data and 'host_id' not in mutable_data:
            mutable_data['host_id'] = mutable_data['hostId']
        if 'startDate' in mutable_data and 'start_date' not in mutable_data:
            mutable_data['start_date'] = mutable_data['startDate']
        if 'endDate' in mutable_data and 'end_date' not in mutable_data:
            mutable_data['end_date'] = mutable_data['endDate']
        if 'startTime' in mutable_data and 'start_time' not in mutable_data:
            mutable_data['start_time'] = mutable_data['startTime']
        if 'recurringPattern' in mutable_data and 'recurring_pattern' not in mutable_data:
            mutable_data['recurring_pattern'] = mutable_data['recurringPattern']
        if 'recurringDays' in mutable_data and 'recurring_days' not in mutable_data:
            mutable_data['recurring_days'] = mutable_data['recurringDays']
        if 'repeatMonths' in mutable_data and 'repeat_months' not in mutable_data:
            mutable_data['repeat_months'] = mutable_data['repeatMonths']
        if 'seriesId' in mutable_data and 'series_id' not in mutable_data:
            mutable_data['series_id'] = mutable_data['seriesId']
        if 'aiSummary' in mutable_data and 'ai_summary' not in mutable_data:
            mutable_data['ai_summary'] = mutable_data['aiSummary']
        if 'transcript' in mutable_data and 'transcript' not in mutable_data:
            mutable_data['transcript'] = mutable_data['transcript']
        if self.instance and self.instance.id:
            mutable_data['id'] = self.instance.id
        return super().to_internal_value(mutable_data)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    meetingId = serializers.CharField(source='meeting_id', required=False)
    batchId = serializers.CharField(source='batch_id', required=False)
    companyId = serializers.CharField(source='company_id', required=False, allow_blank=True)
    date = serializers.CharField(required=False, allow_blank=True)
    userId = serializers.CharField(source='user_id', required=False)
    userName = serializers.CharField(source='user_name', required=False)
    userRole = serializers.CharField(source='user_role', required=False, default='client')
    minutesPresent = serializers.IntegerField(source='minutes_present', required=False, default=0)
    totalMeetingMinutes = serializers.IntegerField(source='total_meeting_minutes', required=False, default=45)
    notes = serializers.CharField(required=False, allow_blank=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'meetingId',
            'batchId',
            'companyId',
            'date',
            'userId',
            'userName',
            'userRole',
            'status',
            'minutesPresent',
            'totalMeetingMinutes',
            'notes',
            'createdAt',
            'updatedAt',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'meetingId' in mutable_data and 'meeting_id' not in mutable_data:
            mutable_data['meeting_id'] = mutable_data['meetingId']
        if 'batchId' in mutable_data and 'batch_id' not in mutable_data:
            mutable_data['batch_id'] = mutable_data['batchId']
        if 'companyId' in mutable_data and 'company_id' not in mutable_data:
            mutable_data['company_id'] = mutable_data['companyId']
        if 'userId' in mutable_data and 'user_id' not in mutable_data:
            mutable_data['user_id'] = mutable_data['userId']
        if 'userName' in mutable_data and 'user_name' not in mutable_data:
            mutable_data['user_name'] = mutable_data['userName']
        if 'userRole' in mutable_data and 'user_role' not in mutable_data:
            mutable_data['user_role'] = mutable_data['userRole']
        if 'minutesPresent' in mutable_data and 'minutes_present' not in mutable_data:
            mutable_data['minutes_present'] = mutable_data['minutesPresent']
        if 'totalMeetingMinutes' in mutable_data and 'total_meeting_minutes' not in mutable_data:
            mutable_data['total_meeting_minutes'] = mutable_data['totalMeetingMinutes']
        if self.instance and self.instance.id:
            mutable_data['id'] = self.instance.id
        return super().to_internal_value(mutable_data)






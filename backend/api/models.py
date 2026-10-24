from django.db import models
import time
import datetime

class DemoRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('credential_created', 'Credential Created'),
        ('closed', 'Closed'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=50)
    company_name = models.CharField(max_length=255)
    team_size = models.CharField(max_length=100, default='10-25 members')
    requirements = models.TextField(blank=True, default='')
    submitted_at = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, default='pending', choices=STATUS_CHOICES)
    dummy_credential = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"demo_{int(time.time() * 1000)}"
        if not self.submitted_at:
            self.submitted_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.company_name} - {self.name} ({self.status})"


class PricingPlan(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=500, blank=True, default='')
    monthly_price = models.FloatField(default=0)
    yearly_price = models.FloatField(default=0)
    currency = models.CharField(max_length=10, default='INR')
    currency_symbol = models.CharField(max_length=10, default='₹')
    popular = models.BooleanField(default=False)
    features = models.JSONField(default=list)
    max_users = models.IntegerField(default=100)
    max_clients = models.IntegerField(default=20)
    whatsapp_integration = models.BooleanField(default=True)
    email_alerts = models.BooleanField(default=True)
    ai_transcripts = models.BooleanField(default=False)
    custom_branding = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['monthly_price', 'created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"plan_{int(time.time() * 1000)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.currency_symbol}{self.monthly_price}/mo)"


class CompanyOrganization(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
    ]
    TIER_CHOICES = [
        ('Starter', 'Starter'),
        ('Growth', 'Growth'),
        ('Enterprise', 'Enterprise'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    company_name = models.CharField(max_length=255)
    admin_name = models.CharField(max_length=255)
    admin_email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255, default='OrgDefault@2026')
    phone = models.CharField(max_length=50, blank=True, default='')
    website = models.CharField(max_length=255, blank=True, default='')
    industry = models.CharField(max_length=255, blank=True, default='Enterprise Software & Logistics')
    tier = models.CharField(max_length=100, default='Enterprise', blank=True)
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    total_clients = models.IntegerField(default=0)
    total_users = models.IntegerField(default=1)
    total_batches = models.IntegerField(default=0)
    active_meetings_count = models.IntegerField(default=0)
    storage_used_mb = models.FloatField(default=0)
    whatsapp_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)
    # Admin receiving bank and payout account fields
    bank_name = models.CharField(max_length=255, blank=True, default='HDFC Bank')
    account_holder_name = models.CharField(max_length=255, blank=True, default='')
    account_number = models.CharField(max_length=100, blank=True, default='')
    ifsc_code = models.CharField(max_length=50, blank=True, default='')
    account_type = models.CharField(max_length=50, blank=True, default='Current Account')
    upi_id = models.CharField(max_length=100, blank=True, default='')
    qr_code_url = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"org_{int(time.time() * 1000)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.company_name} ({self.admin_email})"


class ProductAdminUser(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255, default='AdminPass#2026')
    role = models.CharField(max_length=50, default='product_admin')
    phone = models.CharField(max_length=50, blank=True, default='')
    designation = models.CharField(max_length=255, blank=True, default='Product Administrator')
    assigned_company_admin_ids = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"padmin_{int(time.time() * 1000)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"


class ClientCompany(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    website_url = models.CharField(max_length=255, blank=True, default='')
    documents = models.JSONField(default=list, blank=True)
    batch_id = models.CharField(max_length=100, default='batch_alpha')
    company_id = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"client_comp_{int(time.time() * 1000)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.client_name} ({self.batch_id})"


class WorkspaceUser(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    ROLE_CHOICES = [
        ('product_super_admin', 'Product Super Admin'),
        ('product_admin', 'Product Admin'),
        ('company_admin', 'Company Admin'),
        ('client', 'Client'),
        ('work_user', 'Work User'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='work_user')
    password = models.CharField(max_length=255, blank=True, default='Pass#2026')
    avatar = models.TextField(blank=True, default='')
    company_id = models.CharField(max_length=100, blank=True, default='')
    company_name = models.CharField(max_length=255, blank=True, default='')
    batch_ids = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    phone = models.CharField(max_length=50, blank=True, default='')
    designation = models.CharField(max_length=255, blank=True, default='')
    joined_date = models.CharField(max_length=50, blank=True, default='')
    assigned_company_admin_ids = models.JSONField(default=list, blank=True)
    linkedin = models.CharField(max_length=255, blank=True, default='')
    github = models.CharField(max_length=255, blank=True, default='')
    portfolio_url = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"user_{int(time.time() * 1000)}"
        if not self.joined_date:
            self.joined_date = datetime.datetime.now().strftime('%Y-%m-%d')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role} [{','.join(self.batch_ids)}]"


class ProjectMOU(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active Agreement'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]
    BILLING_CHOICES = [
        ('monthly', 'Monthly Recurring'),
        ('quarterly', 'Quarterly'),
        ('milestone', 'Milestone Based'),
        ('annual', 'Annual'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    company_id = models.CharField(max_length=100, blank=True, default='comp_acme')
    client_company_id = models.CharField(max_length=100, blank=True, default='')
    client_name = models.CharField(max_length=255, blank=True, default='')
    client_email = models.EmailField(max_length=255, blank=True, default='')
    project_title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    total_amount = models.FloatField(default=0.0)
    monthly_amount = models.FloatField(default=0.0)
    currency = models.CharField(max_length=10, default='INR')
    currency_symbol = models.CharField(max_length=10, default='₹')
    billing_frequency = models.CharField(max_length=50, default='monthly', choices=BILLING_CHOICES)
    billing_day_of_month = models.IntegerField(default=5)
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    mou_terms = models.TextField(blank=True, default='')
    signed_date = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"mou_{int(time.time() * 1000)}"
        if not self.start_date:
            self.start_date = datetime.date.today().strftime('%Y-%m-%d')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.project_title} - {self.client_name} ({self.status})"


class PaymentRecord(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid / Done'),
        ('pending', 'Pending / Not Done'),
        ('overdue', 'Overdue'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    project_mou_id = models.CharField(max_length=100, blank=True, default='')
    company_id = models.CharField(max_length=100, blank=True, default='comp_acme')
    client_company_id = models.CharField(max_length=100, blank=True, default='')
    client_name = models.CharField(max_length=255, blank=True, default='')
    client_email = models.EmailField(max_length=255, blank=True, default='')
    title = models.CharField(max_length=255)
    invoice_number = models.CharField(max_length=100, blank=True, default='')
    billing_month = models.CharField(max_length=50, default='')
    amount = models.FloatField(default=0.0)
    currency = models.CharField(max_length=10, default='INR')
    currency_symbol = models.CharField(max_length=10, default='₹')
    due_date = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=50, default='pending', choices=STATUS_CHOICES)
    paid_date = models.CharField(max_length=50, blank=True, default='')
    payment_method = models.CharField(max_length=100, blank=True, default='')
    transaction_reference = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    receipt_url = models.CharField(max_length=500, blank=True, default='')
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-due_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"pay_{int(time.time() * 1000)}"
        if not self.invoice_number:
            self.invoice_number = f"INV-{datetime.date.today().strftime('%Y%m')}-{int(time.time()) % 10000:04d}"
        if not self.billing_month:
            self.billing_month = datetime.date.today().strftime('%Y-%m')
        # Check overdue status if pending and due_date has passed
        if self.status == 'pending' and self.due_date:
            try:
                due = datetime.datetime.strptime(self.due_date[:10], '%Y-%m-%d').date()
                if due < datetime.date.today():
                    self.status = 'overdue'
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.client_name} - {self.amount} ({self.status})"


class CommunityPost(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    batch_id = models.CharField(max_length=100, db_index=True)
    company_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    author_id = models.CharField(max_length=100)
    author_name = models.CharField(max_length=255)
    author_role = models.CharField(max_length=50, default='client')
    author_avatar = models.TextField(blank=True, default='')
    title = models.CharField(max_length=500)
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    created_at_display = models.CharField(max_length=100, blank=True, default='')
    likes = models.IntegerField(default=0)
    liked_by = models.JSONField(default=list, blank=True)
    replies = models.JSONField(default=list, blank=True)
    attachment_url = models.TextField(blank=True, default='')
    attachments = models.JSONField(default=list, blank=True)
    links = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"post_{int(time.time() * 1000)}"
        if not self.created_at_display:
            self.created_at_display = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.author_name} ({self.batch_id})"


class ChatMessage(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    batch_id = models.CharField(max_length=100, db_index=True)
    company_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    sender_id = models.CharField(max_length=100, db_index=True)
    sender_name = models.CharField(max_length=255)
    sender_role = models.CharField(max_length=50, default='client')
    sender_avatar = models.TextField(blank=True, default='')
    recipient_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    text = models.TextField(blank=True, default='')
    timestamp = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='delivered')
    attachment = models.JSONField(default=dict, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    reactions = models.JSONField(default=dict, blank=True)
    is_edited = models.BooleanField(default=False)
    deleted_for_user_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"msg_{int(time.time() * 1000)}"
        if not self.timestamp:
            self.timestamp = datetime.datetime.now().strftime('%I:%M %p')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.batch_id}] {self.sender_name} -> {self.recipient_id or 'Group'}: {self.text[:30]} ({self.status})"


class DeliverableResource(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    batch_id = models.CharField(max_length=100, db_index=True)
    company_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    uploader_id = models.CharField(max_length=100, db_index=True)
    uploader_name = models.CharField(max_length=255)
    uploader_role = models.CharField(max_length=50, default='work_user')
    file_type = models.CharField(max_length=100, default='PDF Document')
    file_size = models.CharField(max_length=50, blank=True, default='')
    file_name = models.CharField(max_length=255, blank=True, default='')
    file_url = models.TextField(blank=True, default='')
    external_link = models.TextField(blank=True, default='')
    reviews = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"res_{int(time.time() * 1000)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.batch_id}] {self.title} ({self.uploader_name})"


class SystemIntegrationSettings(models.Model):
    id = models.CharField(max_length=100, primary_key=True, default='default')
    ai_provider = models.CharField(max_length=50, default='gemini')
    model_name = models.CharField(max_length=100, default='gemini-2.5-flash')
    api_key = models.TextField(blank=True, default='AIzaSyA4EXAMPLE_MOCK_GEMINI_KEY_2026')
    whatsapp_enabled_global = models.BooleanField(default=True)
    email_alerts_global = models.BooleanField(default=True)
    demo_whatsapp_number = models.CharField(max_length=100, blank=True, default='+1 (555) 019-2831')
    company_settings = models.JSONField(default=dict, blank=True)
    client_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"System Integration ({self.ai_provider} - {self.model_name})"


class CompanySettingsConfig(models.Model):
    id = models.CharField(max_length=100, primary_key=True, default='default')
    company_id = models.CharField(max_length=100, default='default', db_index=True)
    allow_chat_with_users = models.BooleanField(default=True)
    whatsapp_alerts_enabled = models.BooleanField(default=True)
    email_alerts_enabled = models.BooleanField(default=True)
    universal_default_password = models.CharField(max_length=255, default='OmniDefault@2026')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['company_id']

    def __str__(self):
        return f"Company Settings [{self.company_id}]"


class WorkspaceBatch(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, blank=True, default='')
    company_id = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    client_count = models.IntegerField(default=0)
    worker_count = models.IntegerField(default=0)
    start_date = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=50, default='active', choices=STATUS_CHOICES)
    lead_admin_id = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"batch_{int(time.time() * 1000)}"
        if not self.start_date:
            self.start_date = datetime.datetime.now().strftime('%Y-%m-%d')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.company_id}"

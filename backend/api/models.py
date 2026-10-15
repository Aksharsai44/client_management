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


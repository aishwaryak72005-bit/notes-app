from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    harish = User.objects.filter(username__iexact='HarishKumar').first()
    if not harish:
        User.objects.create(
            username='HarishKumar',
            email='harish@technotes.com',
            password=make_password('Aichu@2026'),
            first_name='Harish',
            last_name='Kumar',
            role='admin',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_approved_teacher=True
        )
        print("[MIGRATION] Admin 'HarishKumar' created successfully.")
    else:
        harish.password = make_password('Aichu@2026')
        harish.role = 'admin'
        harish.is_staff = True
        harish.is_superuser = True
        harish.is_active = True
        harish.is_approved_teacher = True
        harish.save()
        print("[MIGRATION] Admin 'HarishKumar' credentials updated successfully.")

def reverse_func(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_func),
    ]

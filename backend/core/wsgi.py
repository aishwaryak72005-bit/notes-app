"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

def auto_bootstrap():
    """
    Automatically runs migrations and ensures admin & trainer accounts
    exist upon server start. Eliminates any need for a manual Render shell.
    """
    try:
        from django.core.management import call_command
        from django.contrib.auth import get_user_model

        # 1. Automatically run all pending database migrations
        call_command('migrate', interactive=False)

        # 2. Automatically ensure superuser 'admin' exists
        User = get_user_model()
        admin_user = User.objects.filter(username='admin').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@technotes.com',
                password='admin123',
                first_name='Lead',
                last_name='Admin',
                role='admin',
            )
            print("Auto-bootstrap: Superuser 'admin' created with password 'admin123'.")
        else:
            # Ensure staff and superuser permissions are active
            changed = False
            if not admin_user.is_superuser:
                admin_user.is_superuser = True
                changed = True
            if not admin_user.is_staff:
                admin_user.is_staff = True
                changed = True
            if admin_user.role != 'admin':
                admin_user.role = 'admin'
                changed = True
            if changed:
                admin_user.save()

        # 3. Automatically ensure trainer 'teacher_sarah' exists
        trainer = User.objects.filter(username='teacher_sarah').first()
        if not trainer:
            trainer = User.objects.create_user(
                username='teacher_sarah',
                email='sarah@technotes.com',
                password='teacher123',
                first_name='Sarah',
                last_name='Trainer',
                role='teacher',
                is_staff=True,
            )
        else:
            if not trainer.is_staff or trainer.role != 'teacher':
                trainer.is_staff = True
                trainer.role = 'teacher'
                trainer.save()

        # 4. Automatically ensure distinct quizzes exist across all tech tracks
        try:
            from seed_track_quizzes import seed_quizzes
            from quizzes.models import Quiz
            if Quiz.objects.count() < 15:
                seed_quizzes()
        except Exception as seed_err:
            print(f"Quiz auto-seed note: {seed_err}")

    except Exception as exc:
        print(f"Auto-bootstrap notice (non-fatal): {exc}")

auto_bootstrap()


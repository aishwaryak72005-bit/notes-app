from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "service": "TechNotes Backend API",
        "message": "API is running smoothly!",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/auth/",
            "content": "/api/content/technologies/",
            "quizzes": "/api/quizzes/",
            "ai": "/api/ai/chat/"
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/content/', include('content.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/ai/', include('ai_tutor.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

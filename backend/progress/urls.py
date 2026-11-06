from django.urls import path
from .views import (
    BookmarkListView,
    ToggleBookmarkView,
    CheckBookmarkView,
    MarkCompleteView,
    CheckProgressView,
    DetailedAnalyticsView,
)

urlpatterns = [
    path('bookmarks/', BookmarkListView.as_view(), name='bookmark_list'),
    path('bookmarks/<int:concept_id>/toggle/', ToggleBookmarkView.as_view(), name='toggle_bookmark'),
    path('bookmarks/<int:concept_id>/check/', CheckBookmarkView.as_view(), name='check_bookmark'),
    path('progress/<int:concept_id>/complete/', MarkCompleteView.as_view(), name='mark_complete'),
    path('progress/<int:concept_id>/check/', CheckProgressView.as_view(), name='check_progress'),
    path('analytics/', DetailedAnalyticsView.as_view(), name='analytics'),
]

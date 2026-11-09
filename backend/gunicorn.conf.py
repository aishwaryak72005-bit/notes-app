import os

# Gunicorn configuration for Render deployment
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = 2
timeout = 180
graceful_timeout = 30
keepalive = 2
max_requests = 200
max_requests_jitter = 25
worker_class = "sync"

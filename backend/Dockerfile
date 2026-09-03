FROM python:3.12-slim

# Python environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/tmp

# Application directory
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# Install dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Give appuser ownership of application files
RUN chown -R appuser:appgroup /app && \
    chmod 1777 /tmp

# Run as non-root user
USER appuser

# Application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/api/health')" || exit 1

# Start Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--worker-tmp-dir", "/tmp", "app:app"]v

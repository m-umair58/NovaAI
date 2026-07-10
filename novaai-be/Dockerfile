FROM python:3.13-slim

WORKDIR /app

# Install dependencies first for better layer caching.
# List matches pyproject.toml [project].dependencies exactly.
COPY pyproject.toml .
RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "openai>=1.50.0" \
    "pydantic>=2.0" \
    "pydantic-settings>=2.0" \
    "uvicorn[standard]>=0.32.0"

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

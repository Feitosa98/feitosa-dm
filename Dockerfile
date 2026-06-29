FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies for Samba AD, Python and FastAPI
RUN apt-get update && apt-get install -y \
    samba \
    smbclient \
    winbind \
    libpam-winbind \
    libnss-winbind \
    krb5-user \
    samba-dsdb-modules \
    samba-vfs-modules \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup Python environment
COPY backend/requirements.txt /app/backend/
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --no-cache-dir -r /app/backend/requirements.txt && \
    /app/venv/bin/pip install gunicorn

# Copy backend code
COPY backend/ /app/backend/

# Copy frontend built files
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy entrypoint
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 80
EXPOSE 53 88 135 137 138 139 389 445 464 636 3268 3269

ENTRYPOINT ["/app/entrypoint.sh"]

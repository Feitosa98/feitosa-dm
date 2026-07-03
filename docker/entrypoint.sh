#!/bin/bash

if [ -f "/etc/samba/smb.conf" ]; then
    echo "Iniciando daemons do Samba..."
    samba -D
fi

# Inicializa a API e serve o frontend na porta 8000 (O Caddy fara o proxy na 80/443)
echo "Iniciando Feitosa Directory Manager..."
cd /app/backend
/app/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

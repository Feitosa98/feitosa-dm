#!/bin/bash

# Se o Samba estiver provisionado (arquivo smb.conf customizado existe), inicie os daemons
if [ -f "/etc/samba/smb.conf.feitosa" ]; then
    echo "Iniciando daemons do Samba..."
    # Copia o conf provisionado pro lugar certo, se aplicavel
    cp /etc/samba/smb.conf.feitosa /etc/samba/smb.conf
    samba-tool process --daemon
fi

# Inicializa a API e serve o frontend na porta 8000 (O Caddy fara o proxy na 80/443)
echo "Iniciando Feitosa Directory Manager..."
cd /app/backend
/app/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

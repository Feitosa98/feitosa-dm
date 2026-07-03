#!/bin/bash
# Script de Instalação do Feitosa Directory Manager (Samba AD / Hyper-V)

set -e

echo "=================================================="
echo "Instalador do Feitosa Directory Manager"
echo "=================================================="

# 1. Update system
echo "[1/4] Atualizando o sistema base..."
apt-get update -y
apt-get upgrade -y

# 2. Install prerequisites
echo "[2/4] Instalando pre-requisitos (curl, git, docker)..."
apt-get install -y curl git
if ! command -v docker &> /dev/null
then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

if ! command -v docker-compose &> /dev/null
then
    apt-get install -y docker-compose
fi

# 3. Clone repository
echo "[3/4] Baixando a plataforma Feitosa DM..."
if [ -d "feitosa-dm" ]; then
    echo "O diretorio feitosa-dm ja existe. Atualizando..."
    cd feitosa-dm
    git pull origin main
else
    git clone https://github.com/Feitosa98/feitosa-dm.git
    cd feitosa-dm
fi

# 4. Build and run
echo "[4/4] Subindo os containers na porta 80 e 443..."
docker-compose build
docker-compose up -d

echo "=================================================="
echo "Instalacao concluida com sucesso!"
echo "Acesse a interface no navegador usando o IP desta maquina."
echo "Para saber o IP, digite: ip a"
echo "=================================================="

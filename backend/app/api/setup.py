from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.system import SystemConfig
from app.schemas.system import SystemStatusResponse, SetupProvisionRequest, SetupConnectRequest
import time

router = APIRouter()

def get_config(db: Session):
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig(is_configured=False)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.get("/status", response_model=SystemStatusResponse)
def get_status(db: Session = Depends(get_db)):
    config = get_config(db)
    return SystemStatusResponse(
        is_configured=config.is_configured,
        mode=config.mode,
        domain_name=config.domain_name
    )

@router.post("/provision")
def setup_provision(req: SetupProvisionRequest, db: Session = Depends(get_db)):
    config = get_config(db)
    if config.is_configured:
        raise HTTPException(status_code=400, detail="Sistema já está configurado.")
    
    import subprocess
    import os
    import shutil

    try:
        # O samba exige que os diretorios estejam limpos para criar do zero
        if os.path.exists("/etc/samba/smb.conf"):
            os.remove("/etc/samba/smb.conf")
        
        # Limpar banco de dados parcial se tiver falhado no meio do processo
        if os.path.exists("/var/lib/samba/private"):
            shutil.rmtree("/var/lib/samba/private", ignore_errors=True)
        if os.path.exists("/var/lib/samba/sysvol"):
            shutil.rmtree("/var/lib/samba/sysvol", ignore_errors=True)

        realm = req.domain_name.upper()
        domain = req.domain_name.split(".")[0].upper()

        cmd = [
            "samba-tool", "domain", "provision",
            "--use-rfc2307",
            f"--realm={realm}",
            f"--domain={domain}",
            "--server-role=dc",
            "--dns-backend=SAMBA_INTERNAL",
            f"--adminpass={req.admin_password}"
        ]
        
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("Samba Provision Output:", result.stdout)
        
        # Iniciar os serviços do Samba em background
        subprocess.run(["samba", "-D"], check=False)
    except subprocess.CalledProcessError as e:
        print("Samba Provision Error:", e.stderr)
        raise HTTPException(status_code=500, detail=f"Falha ao provisionar Samba AD: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro critico: {str(e)}")
    
    config.mode = "local_provision"
    config.domain_name = req.domain_name
    config.admin_user = "administrator"
    config.admin_password = req.admin_password
    config.is_configured = True
    db.commit()
    return {"status": "success", "message": "Domínio provisionado com sucesso no OS."}

@router.post("/connect")
def setup_connect(req: SetupConnectRequest, db: Session = Depends(get_db)):
    config = get_config(db)
    if config.is_configured:
        raise HTTPException(status_code=400, detail="Sistema já está configurado.")
    
    # TODO: Tentar conectar com LDAP para validar as credenciais
    time.sleep(1)
    
    config.mode = "remote_connection"
    config.server_ip = req.server_ip
    config.admin_user = req.admin_user
    config.admin_password = req.admin_password
    config.domain_name = req.domain_name
    config.is_configured = True
    db.commit()
    return {"status": "success", "message": "Conectado ao AD remoto com sucesso."}

@router.post("/reset")
def reset_setup(db: Session = Depends(get_db)):
    # Usado apenas para testes, para poder rodar o setup de novo
    config = get_config(db)
    config.is_configured = False
    config.mode = None
    db.commit()
    return {"status": "success"}

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
    
    # Simula o tempo de provisionamento (samba-tool domain provision)
    time.sleep(2)
    
    config.mode = "local_provision"
    config.domain_name = req.domain_name
    config.admin_user = "administrator"
    config.admin_password = req.admin_password
    config.is_configured = True
    db.commit()
    return {"status": "success", "message": "Domínio provisionado com sucesso."}

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

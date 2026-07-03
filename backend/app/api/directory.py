from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.core.ad_manager import ADManager
from app.core.database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel

router = APIRouter()

def get_connector(db: Session = Depends(get_db)):
    manager = ADManager(db)
    return manager.get_connector()

# ========================================
# Usuários
# ========================================
class UserCreate(BaseModel):
    username: str
    name: str
    password: str
    groups: list[str] = ["Domain Users"]

@router.get("/users")
def get_users(connector = Depends(get_connector)):
    users = connector.get_users()
    return {"users": users}

@router.post("/users")
def create_user(user: UserCreate, connector = Depends(get_connector)):
    new_user = connector.create_user(user.model_dump())
    return {"status": "success", "user": new_user}

@router.put("/users/{id}")
def update_user(id: int, user: dict, connector = Depends(get_connector)):
    return {"status": "success"}

@router.delete("/users/{id}")
def delete_user(id: str, connector = Depends(get_connector)):
    success = connector.delete_user(id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Erro ao deletar usuário.")
    return {"status": "success"}

@router.post("/users/{id}/reset-password")
def reset_password(id: str, data: dict, connector = Depends(get_connector)):
    new_password = data.get("new_password")
    if not new_password:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Nova senha não fornecida.")
    
    success = connector.reset_password(id, new_password)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Erro ao redefinir a senha.")
    return {"status": "success"}

# ========================================
# Grupos
# ========================================
class GroupCreate(BaseModel):
    name: str
    description: str

@router.get("/groups")
def get_groups(connector = Depends(get_connector)):
    groups = connector.get_groups()
    return {"groups": groups}

@router.post("/groups")
def create_group(group: GroupCreate, connector = Depends(get_connector)):
    new_group = connector.create_group(group.model_dump())
    return {"status": "success", "group": new_group}

@router.put("/groups/{id}")
def update_group(id: int, group: dict, connector = Depends(get_connector)):
    return {"status": "success"}

@router.delete("/groups/{id}")
def delete_group(id: str, connector = Depends(get_connector)):
    success = connector.delete_group(id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Erro ao deletar grupo.")
    return {"status": "success"}

# ========================================
# OUs (Unidades Organizacionais)
# ========================================
class OUCreate(BaseModel):
    name: str
    description: str

@router.get("/ous")
def get_ous(connector = Depends(get_connector)):
    ous = connector.get_ous()
    return {"ous": ous}

@router.post("/ous")
def create_ou(ou: OUCreate, connector = Depends(get_connector)):
    new_ou = connector.create_ou(ou.model_dump())
    return {"status": "success", "ou": new_ou}

@router.delete("/ous/{id}")
def delete_ou(id: str, connector = Depends(get_connector)):
    success = connector.delete_ou(id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Erro ao deletar OU.")
    return {"status": "success"}

# ========================================
# Módulos não migrados (Mocks mantidos)
# ========================================
@router.get("/computers")
def get_computers(connector = Depends(get_connector)):
    comps = connector.get_computers()
    return {"computers": comps}

dns_zones = [{"name": "feitosa.local", "status": "running"}]
dns_records = [{"id": 1, "zone": "feitosa.local", "name": "server", "type": "A", "data": "192.168.1.10"}]

@router.get("/dns/zones")
def get_dns_zones(): return {"zones": dns_zones}
@router.get("/dns/records")
def get_dns_records(zone: str = None): return {"records": dns_records}
@router.post("/dns/records")
def create_dns_record(record: dict): return {"status": "success"}
@router.delete("/dns/records/{record_id}")
def delete_dns_record(record_id: int): return {"status": "success"}

audit_logs = [{"id": 1, "timestamp": "2026-06-26 10:00:00", "user": "admin", "action": "CREATE_USER", "details": "Simulado", "ip": "127.0.0.1"}]
@router.get("/audit/logs")
def get_audit_logs(): return {"logs": audit_logs}

backups = [{"id": 1, "filename": "samba_backup_20260625.tar.gz", "size": "45 MB", "date": "2026-06-25", "status": "success"}]
@router.get("/backups")
def get_backups(): return {"backups": backups}
@router.post("/backups/run")
def run_backup(): return {"status": "success", "backup": backups[0]}
@router.post("/backups/restore/{backup_id}")
def restore_backup(backup_id: int): return {"status": "success"}

shares = [{"id": 1, "name": "Publico", "path": "/srv/samba/publico", "comment": "Geral", "status": "active"}]
@router.get("/shares")
def get_shares(): return {"shares": shares}
@router.get("/shares/{share_id}/acl")
def get_share_acl(share_id: int): return {"acl": []}
@router.post("/shares")
def create_share(share: dict): return {"status": "success"}

from app.models.system import SystemConfig

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), connector = Depends(get_connector)): 
    config = db.query(SystemConfig).first()
    
    # Tenta buscar configs reais do Samba (se houver erro ou for mock, devolve vazias)
    samba_settings = {}
    if hasattr(connector, 'get_settings'):
        samba_settings = connector.get_settings()
        
    return {
        "settings": {
            "domain_name": config.domain_name if config else "Não configurado",
            "functional_level": samba_settings.get("functional_level", "Desconhecido"),
            "password_complexity": samba_settings.get("password_complexity", False),
            "password_history": samba_settings.get("password_history", 0),
            "min_password_length": samba_settings.get("min_password_length", 0),
            "max_password_age": samba_settings.get("max_password_age", 0)
        }
    }

@router.post("/settings")
def update_settings(new_settings: dict): return {"status": "success"}

@router.get("/dashboard")
def get_dashboard_stats(connector = Depends(get_connector)):
    try:
        users = connector.get_users()
        groups = connector.get_groups()
        comps = connector.get_computers()
        return {
            "total_users": len(users),
            "total_groups": len(groups),
            "total_computers": len(comps),
            "samba_status": "active",
            "cpu_usage": 15,
        }
    except Exception as e:
        print(f"Erro no dashboard: {e}")
        return {
            "total_users": 0,
            "total_groups": 0,
            "total_computers": 0,
            "samba_status": "offline",
            "cpu_usage": 0,
        }

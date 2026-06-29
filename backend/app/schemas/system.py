from pydantic import BaseModel
from typing import Optional

class SystemStatusResponse(BaseModel):
    is_configured: bool
    mode: Optional[str] = None
    domain_name: Optional[str] = None

class SetupProvisionRequest(BaseModel):
    domain_name: str
    admin_password: str

class SetupConnectRequest(BaseModel):
    server_ip: str
    admin_user: str
    admin_password: str
    domain_name: Optional[str] = None

from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    is_configured = Column(Boolean, default=False)
    mode = Column(String, nullable=True) # 'local_provision', 'remote_connection', 'mock'
    domain_name = Column(String, nullable=True)
    server_ip = Column(String, nullable=True)
    admin_user = Column(String, nullable=True)
    admin_password = Column(String, nullable=True) # Simples por enquanto

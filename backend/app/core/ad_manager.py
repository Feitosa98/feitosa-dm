from sqlalchemy.orm import Session
from app.models.system import SystemConfig
from app.core.connectors.base import ADConnector
from app.core.connectors.mock import MockConnector
from app.core.connectors.ldap import LDAPConnector
from app.core.connectors.samba import SambaLocalConnector

class ADManager:
    """
    Factory que retorna o Conector correto baseado no estado atual do sistema.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.config = self.db.query(SystemConfig).first()
        self._connector = None

    def get_connector(self) -> ADConnector:
        if self._connector:
            return self._connector

        if not self.config or not self.config.is_configured:
            # Fallback para Mock se não estiver configurado (para não quebrar dependências legadas)
            self._connector = MockConnector()
            return self._connector

        if self.config.mode == "remote_connection":
            self._connector = LDAPConnector(
                server_ip=self.config.server_ip,
                admin_user=self.config.admin_user,
                admin_password=self.config.admin_password,
                domain=self.config.domain_name
            )
        elif self.config.mode == "local_provision":
            self._connector = SambaLocalConnector()
        else:
            self._connector = MockConnector()

        return self._connector

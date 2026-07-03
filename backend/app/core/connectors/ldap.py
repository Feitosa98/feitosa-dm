from typing import List, Dict, Any
from ldap3 import Server, Connection, ALL
from app.core.connectors.base import ADConnector

class LDAPConnector(ADConnector):
    def __init__(self, server_ip: str, admin_user: str, admin_password: str, domain: str = None):
        self.server_ip = server_ip
        self.admin_user = admin_user if '@' in admin_user else f"{admin_user}@{domain}" if domain else admin_user
        self.admin_password = admin_password
        self.domain = domain
        self.conn = None
        
        # Define search base (e.g., DC=empresa,DC=local)
        if self.domain:
            parts = self.domain.split('.')
            self.search_base = ",".join([f"DC={p}" for p in parts])
        else:
            self.search_base = ""

    def connect(self):
        try:
            server = Server(self.server_ip, get_info=ALL)
            self.conn = Connection(server, user=self.admin_user, password=self.admin_password, auto_bind=True)
            return True
        except Exception as e:
            print(f"Erro ao conectar no LDAP: {e}")
            self.conn = None
            return False

    # -- Usuarios --
    def get_users(self) -> List[Dict[str, Any]]:
        if not self.conn:
            self.connect()
            
        if not self.conn:
            return []
            
        self.conn.search(self.search_base, '(objectclass=user)', attributes=['sAMAccountName', 'cn', 'mail'])
        
        users = []
        for entry in self.conn.entries:
            if 'sAMAccountName' in entry:
                users.append({
                    "username": str(entry.sAMAccountName),
                    "name": str(entry.cn) if 'cn' in entry else "",
                    "email": str(entry.mail) if 'mail' in entry else "",
                    "status": "active",
                    "group": "Unknown" # Lógica para listar grupos do user via memberOf seria adicionada aqui
                })
        return users

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Criação de usuário via LDAP requer TLS e payload complexo de atributos. Ficará para próxima etapa.")

    def delete_user(self, username: str) -> bool:
        raise NotImplementedError("Exclusão de usuário via LDAP remota não suportada nesta versão.")

    def reset_password(self, username: str, new_password: str) -> bool:
        raise NotImplementedError("Reset de senha via LDAP requer TLS/SSL ativo.")

    # -- Grupos --
    def get_groups(self) -> List[Dict[str, Any]]:
        if not self.conn:
            self.connect()
            
        if not self.conn:
            return []
            
        self.conn.search(self.search_base, '(objectclass=group)', attributes=['sAMAccountName', 'description', 'member'])
        
        groups = []
        for entry in self.conn.entries:
            if 'sAMAccountName' in entry:
                members_count = len(entry.member) if 'member' in entry and entry.member else 0
                groups.append({
                    "name": str(entry.sAMAccountName),
                    "description": str(entry.description) if 'description' in entry else "",
                    "members_count": members_count
                })
        return groups

    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Criação de grupo via LDAP pendente.")

    def delete_group(self, groupname: str) -> bool:
        raise NotImplementedError("Exclusão de grupo via LDAP pendente.")

    # -- Computadores --
    def get_computers(self) -> List[Dict[str, Any]]:
        if not self.conn:
            self.connect()
            
        if not self.conn:
            return []
            
        self.conn.search(self.search_base, '(objectclass=computer)', attributes=['sAMAccountName', 'operatingSystem', 'dNSHostName'])
        
        computers = []
        for entry in self.conn.entries:
            if 'sAMAccountName' in entry:
                computers.append({
                    "name": str(entry.sAMAccountName).rstrip('$'),
                    "os": str(entry.operatingSystem) if 'operatingSystem' in entry else "Desconhecido",
                    "ip": str(entry.dNSHostName) if 'dNSHostName' in entry else "Desconhecido",
                    "last_logon": "Desconhecido",
                    "status": "active",
                    "ou": "Computers"
                })
        return computers

    # -- OUs --
    def get_ous(self) -> List[Dict[str, Any]]:
        if not self.conn:
            self.connect()
            
        if not self.conn:
            return []
            
        self.conn.search(self.search_base, '(objectclass=organizationalUnit)', attributes=['ou', 'description'])
        
        ous = []
        for entry in self.conn.entries:
            if 'ou' in entry:
                ous.append({
                    "name": str(entry.ou),
                    "description": str(entry.description) if 'description' in entry else "",
                    "users_count": 0
                })
        return ous

    def create_ou(self, ou_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Criação de OU via LDAP pendente.")

    def delete_ou(self, ou_name: str) -> bool:
        raise NotImplementedError("Exclusão de OU via LDAP pendente.")

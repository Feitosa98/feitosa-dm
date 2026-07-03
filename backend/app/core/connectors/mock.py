from typing import List, Dict, Any
from app.core.connectors.base import ADConnector

class MockConnector(ADConnector):
    def __init__(self):
        self.users = [
            {"id": 1, "username": "admin", "name": "Administrator", "email": "admin@feitosa.local", "status": "active", "group": "Domain Admins"},
            {"id": 2, "username": "j.doe", "name": "John Doe", "email": "j.doe@feitosa.local", "status": "active", "group": "Users"},
        ]
        self.groups = [
            {"id": 1, "name": "Domain Admins", "description": "Administrators of the domain", "members_count": 1},
            {"id": 2, "name": "Finance", "description": "Finance Department", "members_count": 5},
            {"id": 3, "name": "IT Support", "description": "IT Support Team", "members_count": 3},
        ]
        self.ous = [
            {"id": 1, "name": "Domain Controllers", "description": "Default OU for DCs", "users_count": 0},
            {"id": 2, "name": "Finance Department", "description": "Finance Users and Computers", "users_count": 15},
            {"id": 3, "name": "IT Operations", "description": "IT Staff", "users_count": 8},
        ]
        self.computers = [
            {"name": "DESKTOP-001", "os": "Windows 11 Pro", "ip": "192.168.1.50", "last_logon": "2026-06-26 08:30:00", "status": "active", "ou": "TI"},
            {"name": "DESKTOP-002", "os": "Windows 10 Pro", "ip": "192.168.1.51", "last_logon": "2026-06-25 14:15:00", "status": "offline", "ou": "Cartorios"},
        ]

    def connect(self):
        pass

    # -- Usuarios --
    def get_users(self) -> List[Dict[str, Any]]:
        return self.users

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        new_user = {
            "id": len(self.users) + 1,
            "username": user_data.get("username"),
            "name": user_data.get("name"),
            "email": user_data.get("email", ""),
            "status": "active",
            "group": user_data.get("group", "Users")
        }
        self.users.append(new_user)
        return new_user

    # -- Grupos --
    def get_groups(self) -> List[Dict[str, Any]]:
        return self.groups

    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        new_group = {
            "id": len(self.groups) + 1,
            "name": group_data.get("name"),
            "description": group_data.get("description", ""),
            "members_count": 0
        }
        self.groups.append(new_group)
        return new_group

    # -- Computers --
    def get_computers(self) -> List[Dict[str, Any]]:
        return self.computers

    # -- OUs --
    def get_ous(self) -> List[Dict[str, Any]]:
        return self.ous

    def create_ou(self, ou_data: Dict[str, Any]) -> Dict[str, Any]:
        new_ou = {
            "id": len(self.ous) + 1,
            "name": ou_data.get("name"),
            "description": ou_data.get("description", ""),
            "users_count": 0
        }
        self.ous.append(new_ou)
        return new_ou

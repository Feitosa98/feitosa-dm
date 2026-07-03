from abc import ABC, abstractmethod
from typing import List, Dict, Any

class ADConnector(ABC):
    
    @abstractmethod
    def connect(self):
        """Estabelece conexao inicial se necessario"""
        pass


    # -- Usuarios --
    @abstractmethod
    def get_users(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_user(self, username: str) -> bool:
        pass

    @abstractmethod
    def reset_password(self, username: str, new_password: str) -> bool:
        pass

    # -- Grupos --
    @abstractmethod
    def get_groups(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_group(self, groupname: str) -> bool:
        pass

    # -- Computers --
    @abstractmethod
    def get_computers(self) -> List[Dict[str, Any]]:
        pass

    # -- OUs --
    @abstractmethod
    def get_ous(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def create_ou(self, ou_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_ou(self, ou_name: str) -> bool:
        pass

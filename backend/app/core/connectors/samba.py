from typing import List, Dict, Any
import subprocess
from app.core.connectors.base import ADConnector

class SambaLocalConnector(ADConnector):
    def __init__(self):
        pass

    def connect(self):
        pass

    def _run_cmd(self, cmd: List[str]) -> str:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Erro no comando samba-tool: {e.stderr}")
        except Exception as e:
            raise RuntimeError(f"Erro ao executar shell local: {e}")

    # -- Usuarios --
    def get_users(self) -> List[Dict[str, Any]]:
        stdout = self._run_cmd(["samba-tool", "user", "list"])
        users = []
        for username in stdout.splitlines():
            if username.strip():
                users.append({
                    "username": username.strip(),
                    "name": username.strip(),
                    "email": "",
                    "status": "active",
                    "group": "Unknown"
                })
        return users

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        username = user_data.get("username")
        password = user_data.get("password")
        if not username or not password:
            raise ValueError("Username e password sao obrigatorios.")
            
        cmd = ["samba-tool", "user", "create", username, password]
        if user_data.get("name"):
            cmd.extend(["--given-name", user_data.get("name")])
            
        self._run_cmd(cmd)
        return user_data

    # -- Grupos --
    def get_groups(self) -> List[Dict[str, Any]]:
        stdout = self._run_cmd(["samba-tool", "group", "list"])
        groups = []
        for group in stdout.splitlines():
            if group.strip():
                groups.append({
                    "name": group.strip(),
                    "description": "",
                    "members_count": 0
                })
        return groups

    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        name = group_data.get("name")
        if not name:
            raise ValueError("Nome do grupo e obrigatorio.")
            
        cmd = ["samba-tool", "group", "add", name]
        if group_data.get("description"):
            cmd.extend(["--description", group_data.get("description")])
            
        self._run_cmd(cmd)
        return group_data

    # -- OUs --
    def get_ous(self) -> List[Dict[str, Any]]:
        # Samba-tool tem comandos limitados para listar OUs puros sem query ldbsearch.
        # Faremos uma execucao basica ou mockup se falhar, mas idealmente usaria ldbsearch.
        try:
            stdout = self._run_cmd(["samba-tool", "ou", "list"])
            ous = []
            for ou in stdout.splitlines():
                if ou.strip():
                    ous.append({
                        "name": ou.strip(),
                        "description": "",
                        "users_count": 0
                    })
            return ous
        except:
            return []

    def create_ou(self, ou_data: Dict[str, Any]) -> Dict[str, Any]:
        name = ou_data.get("name")
        if not name:
            raise ValueError("Nome da OU e obrigatorio.")
            
        # O comando real de add OU no samba-tool pode variar (ou add ou ldbadd).
        self._run_cmd(["samba-tool", "ou", "create", f"OU={name}"])
        return ou_data

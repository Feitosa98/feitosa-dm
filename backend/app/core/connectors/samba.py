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
        try:
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
        except Exception as e:
            print(f"SambaLocalConnector: Falha ao listar usuarios - {e}")
            return []

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
        try:
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
        except Exception as e:
            print(f"SambaLocalConnector: Falha ao listar grupos - {e}")
            return []

    def create_group(self, group_data: Dict[str, Any]) -> Dict[str, Any]:
        name = group_data.get("name")
        if not name:
            raise ValueError("Nome do grupo e obrigatorio.")
            
        cmd = ["samba-tool", "group", "add", name]
        if group_data.get("description"):
            cmd.extend(["--description", group_data.get("description")])
            
        self._run_cmd(cmd)
        return group_data

    # -- Computadores --
    def get_computers(self) -> List[Dict[str, Any]]:
        try:
            stdout = self._run_cmd(["samba-tool", "computer", "list"])
            computers = []
            for comp in stdout.splitlines():
                if comp.strip():
                    computers.append({
                        "name": comp.strip(),
                        "os": "Desconhecido",
                        "ip": "Desconhecido",
                        "last_logon": "Desconhecido",
                        "status": "active",
                        "ou": "Computers"
                    })
            return computers
        except Exception as e:
            print(f"SambaLocalConnector: Falha ao listar computadores - {e}")
            return []

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

    # -- Configuracoes e Status --
    def get_settings(self) -> Dict[str, Any]:
        settings = {
            "functional_level": "Desconhecido",
            "password_complexity": True,
            "password_history": 0,
            "min_password_length": 0,
            "max_password_age": 0
        }
        try:
            # Pegar Functional Level
            lvl_out = self._run_cmd(["samba-tool", "domain", "level", "show"])
            for line in lvl_out.splitlines():
                if line.startswith("Domain function level:"):
                    settings["functional_level"] = line.split(":", 1)[1].strip()
            
            # Pegar Password Settings
            pwd_out = self._run_cmd(["samba-tool", "domain", "passwordsettings", "show"])
            for line in pwd_out.splitlines():
                if "Password complexity:" in line:
                    settings["password_complexity"] = "on" in line.lower()
                elif "Password history length:" in line:
                    settings["password_history"] = int(line.split(":")[1].strip())
                elif "Minimum password length:" in line:
                    settings["min_password_length"] = int(line.split(":")[1].strip())
                elif "Maximum password age (days):" in line:
                    settings["max_password_age"] = int(line.split(":")[1].strip())
        except Exception as e:
            print(f"Erro ao ler settings do Samba: {e}")

        return settings

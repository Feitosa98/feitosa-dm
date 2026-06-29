from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.directory import router as samba_router
from app.api.auth import router as auth_router
from app.api.setup import router as setup_router
from app.core.database import engine, Base, SessionLocal
from app.models.user import PanelUser
from app.models.system import SystemConfig
from app.core.security import get_password_hash
import os

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default admin if not exists
db = SessionLocal()
if not db.query(PanelUser).filter(PanelUser.username == "admin").first():
    default_admin = PanelUser(
        username="admin",
        password_hash=get_password_hash("admin"),
        name="Administrador Padrão",
        role="admin"
    )
    db.add(default_admin)
    db.commit()

# Ensure system config exists
if not db.query(SystemConfig).first():
    config = SystemConfig(is_configured=False)
    db.add(config)
    db.commit()
db.close()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Feitosa Directory Manager API",
    description="API para gerenciamento do Samba Active Directory",
    version="0.3.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Middlewares
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"]) # Configurar ips especificos em prod

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(setup_router, prefix="/api/setup", tags=["Setup"])
app.include_router(samba_router, prefix="/api", tags=["Samba"])

# Servir Frontend Estatico
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

# Rotas especificas para ignorar o frontend
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Servir React SPA
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.api_route("/{path_name:path}", methods=["GET"])
    def catch_all(path_name: str):
        # Ignora rotas da API
        if path_name.startswith("api/"):
            return {"detail": "Not Found"}
        
        file_path = os.path.join(frontend_dist, path_name)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(frontend_dist, "index.html"))

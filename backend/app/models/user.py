from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class PanelUser(Base):
    __tablename__ = "panel_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="admin")

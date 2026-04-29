from sqlalchemy import Column, String, Text, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.sql import func
from app.models.base import Base


class Screenshot(Base):
    __tablename__ = "screenshots"

    id = Column(String, primary_key=True)
    url = Column(String, default="")
    path = Column(String, default="")
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=True)
    step_order = Column(Integer, nullable=True)
    annotations = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Screenshot(id={self.id}, path={self.path})>"
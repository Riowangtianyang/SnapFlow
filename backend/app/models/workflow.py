from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.models.base import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, default="")
    description = Column(Text, default="")
    status = Column(String, default="draft")
    steps = Column(JSON, default=list)
    total_intent = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Workflow(id={self.id}, name={self.name}, status={self.status})>"
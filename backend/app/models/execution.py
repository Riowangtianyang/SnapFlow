from sqlalchemy import Column, String, Text, DateTime, JSON, Integer
from sqlalchemy.sql import func
from app.models.base import Base


class Execution(Base):
    __tablename__ = "executions"

    id = Column(String, primary_key=True)
    workflow_id = Column(String, nullable=False, index=True)
    workflow_name = Column(String, default="")
    status = Column(String, default="pending")  # pending, running, completed, failed
    steps_total = Column(Integer, default=0)
    steps_completed = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    step_results = Column(JSON, default=list)
    error = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Execution(id={self.id}, workflow_id={self.workflow_id}, status={self.status})>"
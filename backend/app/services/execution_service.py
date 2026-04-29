# Execution Service - Database persistence and queries for workflow executions
from datetime import datetime
from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Execution, Workflow
from app.core.executor.playwright_executor import ExecutionResult, ExecutionStatus
from app.services.logger import get_logger

logger = get_logger(__name__)


class ExecutionService:
    @staticmethod
    async def create_execution(
        db: AsyncSession,
        workflow_id: str,
        workflow_name: str,
        steps_count: int
    ) -> Execution:
        """Create a new execution record before running."""
        execution_id = f"exec-{datetime.utcnow().timestamp()}"
        execution = Execution(
            id=execution_id,
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            status="pending",
            steps_total=steps_count,
            steps_completed=0,
            started_at=datetime.utcnow(),
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)
        logger.info(f"Created execution record", extra={"execution_id": execution_id, "workflow_id": workflow_id})
        return execution

    @staticmethod
    async def update_execution_result(
        db: AsyncSession,
        execution_id: str,
        result: ExecutionResult
    ):
        """Update execution with result after completion."""
        result_db = await db.execute(select(Execution).where(Execution.id == execution_id))
        execution = result_db.scalar_one_or_none()
        if not execution:
            logger.warning(f"Execution not found for update", extra={"execution_id": execution_id})
            return

        execution.status = result.status.value
        execution.steps_completed = len([sr for sr in result.step_results if sr.status == ExecutionStatus.COMPLETED])
        execution.completed_at = datetime.utcnow()
        execution.step_results = [
            {
                "step_id": sr.step_id,
                "status": sr.status.value,
                "output": sr.output,
                "error": sr.error,
            }
            for sr in result.step_results
        ]
        if result.status == ExecutionStatus.FAILED:
            errors = [sr.error for sr in result.step_results if sr.error]
            execution.error = "; ".join(errors) if errors else "Unknown error"

        await db.commit()
        logger.info(f"Updated execution result", extra={"execution_id": execution_id, "status": result.status.value})

    @staticmethod
    async def get_execution(db: AsyncSession, execution_id: str) -> Optional[Execution]:
        result = await db.execute(select(Execution).where(Execution.id == execution_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_executions(
        db: AsyncSession,
        limit: int = 20,
        offset: int = 0
    ) -> tuple[List[Execution], int]:
        """List recent executions with total count."""
        count_result = await db.execute(select(func.count(Execution.id)))
        total = count_result.scalar() or 0

        result = await db.execute(
            select(Execution)
            .order_by(Execution.started_at.desc())
            .limit(limit)
            .offset(offset)
        )
        executions = result.scalars().all()
        return list(executions), total

    @staticmethod
    async def get_dashboard_stats(db: AsyncSession) -> dict:
        """Get dashboard statistics."""
        # Total workflows
        wf_result = await db.execute(select(func.count(Workflow.id)))
        total_workflows = wf_result.scalar() or 0

        # Workflow status counts
        wf_all = await db.execute(select(Workflow))
        workflows = wf_all.scalars().all()
        running = sum(1 for w in workflows if w.status == "running")
        completed = sum(1 for w in workflows if w.status == "completed")
        drafts = sum(1 for w in workflows if w.status == "draft")

        # Recent executions (last 30 days) for stats
        thirty_days_ago = datetime.utcnow().replace(day=1)
        exec_result = await db.execute(
            select(Execution).where(Execution.started_at >= thirty_days_ago)
        )
        recent_executions = exec_result.scalars().all()
        monthly_executions = len(recent_executions)
        successful = sum(1 for e in recent_executions if e.status == "completed")
        success_rate = (successful / monthly_executions * 100) if monthly_executions > 0 else 0

        return {
            "total_workflows": total_workflows,
            "running": running,
            "completed": completed,
            "drafts": drafts,
            "monthly_executions": monthly_executions,
            "success_rate": round(success_rate, 1),
        }


execution_service = ExecutionService()

# Execution Routes - Workflow execution endpoints
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Workflow, Execution, get_db
from app.core.executor.playwright_executor import workflow_executor, ExecutionStatus
from app.services.execution_service import execution_service
from app.services.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/run/{workflow_id}", response_model=dict)
async def run_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    logger.info(f"Run workflow requested", extra={"workflow_id": workflow_id})

    # Create execution record
    execution = await execution_service.create_execution(
        db=db,
        workflow_id=workflow_id,
        workflow_name=workflow.name,
        steps_count=len(workflow.steps or [])
    )

    # Execute workflow
    exec_result = await workflow_executor.execute_workflow(
        workflow_id=workflow_id,
        steps=workflow.steps or []
    )

    # Update execution record with result
    await execution_service.update_execution_result(db, execution.id, exec_result)

    return {
        "execution_id": execution.id,
        "workflow_id": exec_result.workflow_id,
        "status": exec_result.status.value,
        "started_at": exec_result.started_at,
        "completed_at": exec_result.completed_at,
        "step_results": [
            {
                "step_id": sr.step_id,
                "status": sr.status.value,
                "output": sr.output,
                "error": sr.error,
            }
            for sr in exec_result.step_results
        ],
    }


@router.get("/status/{execution_id}", response_model=dict)
async def get_execution_status(
    execution_id: str,
    db: AsyncSession = Depends(get_db),
):
    execution = await execution_service.get_execution(db, execution_id)

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {
        "execution_id": execution.id,
        "workflow_id": execution.workflow_id,
        "status": execution.status,
        "started_at": execution.started_at.isoformat() if execution.started_at else None,
        "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
        "steps_completed": execution.steps_completed,
        "steps_total": execution.steps_total,
    }


@router.get("/result/{execution_id}", response_model=dict)
async def get_execution_result(
    execution_id: str,
    db: AsyncSession = Depends(get_db),
):
    execution = await execution_service.get_execution(db, execution_id)

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {
        "execution_id": execution.id,
        "workflow_id": execution.workflow_id,
        "status": execution.status,
        "started_at": execution.started_at.isoformat() if execution.started_at else None,
        "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
        "step_results": execution.step_results or [],
        "error": execution.error,
    }


@router.get("/list", response_model=dict)
async def list_executions(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    executions, total = await execution_service.list_executions(db, limit, offset)
    return {
        "executions": [
            {
                "execution_id": e.id,
                "workflow_id": e.workflow_id,
                "workflow_name": e.workflow_name,
                "status": e.status,
                "started_at": e.started_at.isoformat() if e.started_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "steps_completed": e.steps_completed,
                "steps_total": e.steps_total,
                "error": e.error,
            }
            for e in executions
        ],
        "total": total,
    }


@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    stats = await execution_service.get_dashboard_stats(db)
    return stats

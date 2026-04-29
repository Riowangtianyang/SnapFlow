# Execution Routes - Workflow execution endpoints
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Workflow, get_db
from app.core.executor.playwright_executor import workflow_executor, ExecutionStatus
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

    execution = await workflow_executor.execute_workflow(
        workflow_id=workflow_id,
        steps=workflow.steps or []
    )

    return {
        "execution_id": execution.execution_id,
        "workflow_id": execution.workflow_id,
        "status": execution.status.value,
        "started_at": execution.started_at,
        "completed_at": execution.completed_at,
        "step_results": [
            {
                "step_id": sr.step_id,
                "status": sr.status.value,
                "output": sr.output,
                "error": sr.error,
            }
            for sr in execution.step_results
        ],
    }


@router.get("/status/{execution_id}", response_model=dict)
async def get_execution_status(
    execution_id: str,
):
    execution = workflow_executor.get_execution(execution_id)

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {
        "execution_id": execution.execution_id,
        "workflow_id": execution.workflow_id,
        "status": execution.status.value,
        "started_at": execution.started_at,
        "completed_at": execution.completed_at,
        "steps_completed": len([
            sr for sr in execution.step_results
            if sr.status == ExecutionStatus.COMPLETED
        ]),
        "steps_total": len(execution.step_results),
    }


@router.get("/result/{execution_id}", response_model=dict)
async def get_execution_result(
    execution_id: str,
):
    execution = workflow_executor.get_execution(execution_id)

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {
        "execution_id": execution.execution_id,
        "workflow_id": execution.workflow_id,
        "status": execution.status.value,
        "started_at": execution.started_at,
        "completed_at": execution.completed_at,
        "step_results": [
            {
                "step_id": sr.step_id,
                "status": sr.status.value,
                "output": sr.output,
                "error": sr.error,
            }
            for sr in execution.step_results
        ],
    }

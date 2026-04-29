from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
import uuid
import json

from app.models import Workflow, get_db
from app.schemas import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowSchema,
    WorkflowListItem,
    WorkflowExport,
    WorkflowImport,
    StepSchema,
)

router = APIRouter()


def workflow_to_dict(workflow: Workflow) -> dict:
    steps = workflow.steps if workflow.steps else []
    if isinstance(steps, str):
        steps = json.loads(steps)
    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description or "",
        "status": workflow.status or "draft",
        "steps": steps,
        "total_intent": workflow.total_intent or "",
        "created_at": workflow.created_at,
        "updated_at": workflow.updated_at,
    }


@router.get("", response_model=dict)
@router.get("/", response_model=dict)
async def list_workflows(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).order_by(Workflow.updated_at.desc()))
    workflows = result.scalars().all()
    return {
        "workflows": [
            {
                "id": w.id,
                "name": w.name,
                "description": w.description or "",
                "status": w.status or "draft",
                "created_at": w.created_at,
                "updated_at": w.updated_at,
            }
            for w in workflows
        ]
    }


@router.post("", response_model=dict, status_code=201)
@router.post("/", response_model=dict, status_code=201)
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
):
    workflow_id = str(uuid.uuid4())
    workflow = Workflow(
        id=workflow_id,
        name=workflow_data.name,
        description=workflow_data.description,
        status="draft",
        steps=[s.model_dump() if isinstance(s, StepSchema) else s for s in workflow_data.steps],
        total_intent=workflow_data.total_intent,
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)

    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description or "",
        "status": workflow.status,
        "created_at": workflow.created_at,
        "updated_at": workflow.updated_at,
    }


@router.get("/{workflow_id}", response_model=dict)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return workflow_to_dict(workflow)


@router.put("/{workflow_id}", response_model=dict)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    update_data = workflow_data.model_dump(exclude_unset=True)
    if "steps" in update_data:
        update_data["steps"] = [
            s.model_dump() if isinstance(s, StepSchema) else s
            for s in update_data["steps"]
        ]

    for key, value in update_data.items():
        setattr(workflow, key, value)

    await db.commit()
    await db.refresh(workflow)

    return workflow_to_dict(workflow)


@router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    await db.execute(delete(Workflow).where(Workflow.id == workflow_id))
    await db.commit()

    return Response(status_code=204)


@router.get("/{workflow_id}/export", response_model=dict)
async def export_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    steps = workflow.steps if workflow.steps else []
    if isinstance(steps, str):
        steps = json.loads(steps)

    return {
        "version": "1.0",
        "id": workflow.id,
        "name": workflow.name,
        "steps": steps,
        "total_intent": workflow.total_intent or "",
    }


@router.post("/{workflow_id}/import", response_model=dict, status_code=201)
async def import_workflow(
    workflow_id: str,
    import_data: WorkflowImport,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    existing = result.scalar_one_or_none()

    if existing:
        existing.name = import_data.name
        existing.steps = [s.model_dump() if isinstance(s, StepSchema) else s for s in import_data.steps]
        existing.total_intent = import_data.total_intent
        await db.commit()
        await db.refresh(existing)
        return workflow_to_dict(existing)
    else:
        new_workflow = Workflow(
            id=workflow_id,
            name=import_data.name,
            steps=[s.model_dump() if isinstance(s, StepSchema) else s for s in import_data.steps],
            total_intent=import_data.total_intent,
            status="draft",
        )
        db.add(new_workflow)
        await db.commit()
        await db.refresh(new_workflow)
        return workflow_to_dict(new_workflow)
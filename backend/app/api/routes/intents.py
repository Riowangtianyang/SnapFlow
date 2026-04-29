from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid

from app.core.models import ReasoningModel, ReasoningModelSingleton
from app.models import Workflow, get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter()


class AnnotationInput(BaseModel):
    type: str
    x: float
    y: float
    width: float
    height: float
    label: str = ""
    params: Dict[str, Any] = Field(default_factory=dict)


class ScreenshotInput(BaseModel):
    id: str
    url: str
    annotations: List[AnnotationInput] = Field(default_factory=list)


class IntentGenerateRequest(BaseModel):
    screenshots: List[ScreenshotInput]


class StepOutput(BaseModel):
    id: str
    screenshot_id: Optional[str] = None
    url: str = ""
    type: str
    intent: str
    params: Dict[str, Any] = Field(default_factory=dict)


class QuestionOutput(BaseModel):
    id: str
    q: str
    options: List[str] = Field(default_factory=list)
    answer: Optional[str] = None


class IntentGenerateResponse(BaseModel):
    steps: List[Dict[str, Any]]
    total_intent: str
    questions: List[QuestionOutput]


class IntentRefineRequest(BaseModel):
    workflow_id: str
    question_id: str
    answer: str


class IntentRefineResponse(BaseModel):
    updated_steps: List[Dict[str, Any]]
    updated_total_intent: str
    consumed_questions: List[str]


def get_reasoning_model() -> ReasoningModel:
    return ReasoningModelSingleton.get_instance()


@router.post("/generate", response_model=IntentGenerateResponse)
async def generate_intent(
    request: IntentGenerateRequest,
    model: ReasoningModel = Depends(get_reasoning_model),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate workflow intent from screenshots and annotations.

    This endpoint analyzes screenshot data with AI to produce:
    - steps: workflow steps with actions
    - total_intent: overall workflow description
    - questions: clarification questions if needed
    """
    screenshots_data = [
        {
            "id": shot.id,
            "url": shot.url,
            "annotations": [
                {
                    "type": ann.type,
                    "x": ann.x,
                    "y": ann.y,
                    "width": ann.width,
                    "height": ann.height,
                    "label": ann.label,
                    "params": ann.params,
                }
                for ann in shot.annotations
            ],
        }
        for shot in request.screenshots
    ]

    result = model.generate_intent(screenshots_data)

    steps = result.get("steps", [])
    for i, step in enumerate(steps):
        if "id" not in step:
            step["id"] = f"step-{uuid.uuid4().hex[:8]}"

    questions = [
        QuestionOutput(
            id=q.get("id", f"q-{i}"),
            q=q.get("q", ""),
            options=q.get("options", []),
            answer=q.get("answer"),
        )
        for i, q in enumerate(result.get("questions", []))
    ]

    return IntentGenerateResponse(
        steps=steps,
        total_intent=result.get("total_intent", ""),
        questions=questions,
    )


@router.post("/refine", response_model=IntentRefineResponse)
async def refine_intent(
    request: IntentRefineRequest,
    model: ReasoningModel = Depends(get_reasoning_model),
    db: AsyncSession = Depends(get_db),
):
    """
    Refine workflow intent based on user answer.

    After generating intent, if questions were presented to the user,
    their answers are submitted here to refine the workflow steps.
    """
    result = await db.execute(
        select(Workflow).where(Workflow.id == request.workflow_id)
    )
    workflow = result.scalar_one_or_none()

    previous_context = None
    if workflow:
        previous_context = {
            "steps": workflow.steps if workflow.steps else [],
            "total_intent": workflow.total_intent or "",
        }

    refine_result = model.refine_intent(
        workflow_id=request.workflow_id,
        question_id=request.question_id,
        answer=request.answer,
        previous_context=previous_context,
    )

    if workflow:
        updated_steps = refine_result.get("updated_steps", [])
        updated_total_intent = refine_result.get("updated_total_intent", "")

        workflow.steps = updated_steps
        workflow.total_intent = updated_total_intent
        await db.commit()

    return IntentRefineResponse(
        updated_steps=refine_result.get("updated_steps", []),
        updated_total_intent=refine_result.get("updated_total_intent", ""),
        consumed_questions=refine_result.get("consumed_questions", [request.question_id]),
    )

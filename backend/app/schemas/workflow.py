from pydantic import BaseModel, Field
from typing import Optional, List, Any, Literal
from datetime import datetime
from enum import Enum


class StepType(str, Enum):
    START = "start"
    CLICK = "click"
    EXTRACT = "extract"
    DOWNLOAD = "download"
    NAVIGATE = "navigate"
    WAIT = "wait"
    WAIT_FOR = "wait_for"
    TYPE = "type"
    SCREENSHOT = "screenshot"


class AnnotationType(str, Enum):
    CLICK = "click"
    EXTRACT = "extract"
    DOWNLOAD = "download"


class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Position(BaseModel):
    x: float = 0
    y: float = 0


class LoopConfig(BaseModel):
    mode: Literal["all", "firstN", "lastN"] = "all"
    count: Optional[int] = Field(default=None, ge=1)


class PaginationConfig(BaseModel):
    type: Literal["fixed", "untilEmpty", "dateRange", "loadMore"] = "fixed"
    pages: Optional[int] = Field(default=None, ge=1)
    selector: Optional[str] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None


class AnnotationSchema(BaseModel):
    id: str = Field(default_factory=lambda: f"ann-{datetime.now().timestamp()}")
    type: AnnotationType
    x: float
    y: float
    width: float
    height: float
    label: str = ""
    params: dict = Field(default_factory=dict)


class QuestionSchema(BaseModel):
    id: str = Field(default_factory=lambda: f"q-{datetime.now().timestamp()}")
    q: str
    options: List[str] = Field(default_factory=list)
    answer: Optional[str] = None


class StepSchema(BaseModel):
    id: str = Field(default_factory=lambda: f"step-{datetime.now().timestamp()}")
    type: StepType
    url: str = ""
    intent: str = ""
    params: dict = Field(default_factory=dict)
    annotations: List[AnnotationSchema] = Field(default_factory=list)
    selector: Optional[str] = None
    position: Optional[Position] = None
    loop: Optional[LoopConfig] = None
    pagination: Optional[PaginationConfig] = None
    fields: Optional[List[str]] = None


class WorkflowBase(BaseModel):
    name: str = ""
    description: str = ""


class WorkflowCreate(WorkflowBase):
    steps: List[StepSchema] = Field(default_factory=list)
    total_intent: str = ""


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[StepSchema]] = None
    total_intent: Optional[str] = None
    status: Optional[WorkflowStatus] = None


class WorkflowSchema(BaseModel):
    id: str
    name: str
    description: str = ""
    status: WorkflowStatus = WorkflowStatus.DRAFT
    steps: List[StepSchema] = Field(default_factory=list)
    total_intent: str = ""
    screenshot_ids: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowResponse(WorkflowSchema):
    pass


class WorkflowListItem(BaseModel):
    id: str
    name: str
    description: str = ""
    status: WorkflowStatus = WorkflowStatus.DRAFT
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowExport(BaseModel):
    version: str = "1.0"
    id: str
    name: str
    steps: List[StepSchema]
    total_intent: str

    class Config:
        from_attributes = True


class WorkflowImport(BaseModel):
    version: str = "1.0"
    name: str
    steps: List[StepSchema] = Field(default_factory=list)
    total_intent: str = ""


class ScreenshotBase(BaseModel):
    workflow_id: Optional[str] = None
    step_order: Optional[int] = None


class ScreenshotCreate(ScreenshotBase):
    pass


class ScreenshotAnnotationUpdate(BaseModel):
    annotations: List[AnnotationSchema] = Field(default_factory=list)


class ScreenshotSchema(BaseModel):
    id: str
    url: str
    path: str
    width: int = 0
    height: int = 0
    workflow_id: Optional[str] = None
    step_order: Optional[int] = None
    annotations: List[AnnotationSchema] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class ScreenshotResponse(ScreenshotSchema):
    pass


class ErrorResponse(BaseModel):
    detail: str
    code: str
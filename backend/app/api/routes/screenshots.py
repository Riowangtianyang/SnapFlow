from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Screenshot, get_db
from app.schemas import ScreenshotSchema, ScreenshotAnnotationUpdate
from app.services.storage import save_upload

router = APIRouter()


@router.post("/upload", response_model=dict, status_code=201)
async def upload_screenshot(
    file: UploadFile = File(...),
    workflow_id: str = None,
    step_order: int = None,
    db: AsyncSession = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    upload_data = await save_upload(file, workflow_id, step_order)

    screenshot = Screenshot(
        id=upload_data["id"],
        url=upload_data["url"],
        path=upload_data["path"],
        width=upload_data["width"],
        height=upload_data["height"],
        workflow_id=upload_data["workflow_id"],
        step_order=upload_data["step_order"],
        annotations=[],
    )
    db.add(screenshot)
    await db.commit()
    await db.refresh(screenshot)

    return {
        "id": screenshot.id,
        "url": screenshot.url,
        "path": screenshot.path,
        "width": screenshot.width,
        "height": screenshot.height,
        "workflow_id": screenshot.workflow_id,
        "step_order": screenshot.step_order,
    }


@router.get("/{screenshot_id}", response_model=dict)
async def get_screenshot(
    screenshot_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
    screenshot = result.scalar_one_or_none()

    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    return {
        "id": screenshot.id,
        "url": screenshot.url,
        "path": screenshot.path,
        "width": screenshot.width,
        "height": screenshot.height,
        "workflow_id": screenshot.workflow_id,
        "step_order": screenshot.step_order,
        "annotations": screenshot.annotations or [],
        "created_at": screenshot.created_at,
    }


@router.put("/{screenshot_id}/annotations", response_model=dict)
async def update_annotations(
    screenshot_id: str,
    update_data: ScreenshotAnnotationUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
    screenshot = result.scalar_one_or_none()

    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    screenshot.annotations = [a.model_dump() for a in update_data.annotations]
    await db.commit()
    await db.refresh(screenshot)

    return {
        "id": screenshot.id,
        "annotations": screenshot.annotations or [],
    }
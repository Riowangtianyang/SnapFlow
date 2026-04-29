import os
import uuid
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image
import aiofiles

from app.config import settings


async def save_upload(file, workflow_id: Optional[str] = None, step_order: Optional[int] = None) -> dict:
    """
    Save uploaded file and return metadata including path, url, and dimensions.

    Args:
        file: FastAPI UploadFile
        workflow_id: Optional workflow association
        step_order: Optional step order

    Returns:
        dict with path, url, width, height
    """
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1] or ".png"
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{file_ext}")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    width, height = 0, 0
    try:
        with Image.open(file_path) as img:
            width, height = img.size
    except Exception:
        pass

    return {
        "id": file_id,
        "path": file_path,
        "url": f"/uploads/{file_id}{file_ext}",
        "width": width,
        "height": height,
        "workflow_id": workflow_id,
        "step_order": step_order,
    }


def get_image_dimensions(file_path: str) -> Tuple[int, int]:
    """Get image width and height from file path."""
    try:
        with Image.open(file_path) as img:
            return img.size
    except Exception:
        return 0, 0

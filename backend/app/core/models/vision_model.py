import os
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional
import anthropic
from anthropic import Anthropic

from app.config import settings


class VisionModel:
    """Vision model for screenshot analysis using MiniMax API (Anthropic compatible)."""

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.model = model or os.getenv("VISION_MODEL", "MiniMax-M2.7")
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY") or settings.REASONING_API_KEY
        self.base_url = base_url or os.getenv("ANTHROPIC_BASE_URL") or settings.REASONING_API_BASE

        self.client = Anthropic(
            api_key=self.api_key,
            base_url=self.base_url,
        )

    def _encode_image(self, image_path: str) -> str:
        """Encode image file to base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def analyze_screenshot(
        self,
        image_path: str,
        annotations: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a screenshot with optional annotations.

        Args:
            image_path: Path to the screenshot image file
            annotations: Optional list of annotation data from previous analysis

        Returns:
            Analysis results containing page structure, elements, and suggested actions
        """
        annotations_text = ""
        if annotations:
            annotations_text = "\n".join([
                f"- {ann.get('label', 'Element')} at ({ann.get('x')}, {ann.get('y')}) "
                f"size {ann.get('width')}x{ann.get('height')}, type={ann.get('type')}"
                for ann in annotations
            ])

        image_base64 = self._encode_image(image_path)

        prompt = f"""你是一个专业的网页截图分析助手。请分析这张截图，识别页面结构和关键元素。

{'已标注的元素：' + annotations_text if annotations_text else '暂无预标注元素。'}

请提供：
1. 页面整体结构描述
2. 主要功能区域识别
3. 可交互元素的类型和位置
4. 建议的下一步操作

以结构化的JSON格式返回分析结果。"""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system="你是一个专业的网页截图分析助手。你必须返回结构化的JSON分析结果。",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": prompt,
                        },
                    ],
                }
            ],
        )

        result_text = ""
        for block in message.content:
            if hasattr(block, "text"):
                result_text += block.text

        return {
            "model": self.model,
            "analysis": result_text,
            "usage": {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens,
            },
        }


class VisionModelSingleton:
    """Singleton wrapper for VisionModel to share across the application."""

    _instance: Optional[VisionModel] = None

    @classmethod
    def get_instance(cls) -> VisionModel:
        if cls._instance is None:
            cls._instance = VisionModel()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        cls._instance = None

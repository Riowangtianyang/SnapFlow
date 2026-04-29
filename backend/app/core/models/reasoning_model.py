import os
import json
from typing import List, Dict, Any, Optional
import anthropic
from anthropic import Anthropic

from app.config import settings


class ReasoningModel:
    """Reasoning model for intent generation using MiniMax API (Anthropic compatible)."""

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.model = model or os.getenv("REASONING_MODEL", "MiniMax-M2.7")
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY") or settings.REASONING_API_KEY
        self.base_url = base_url or os.getenv("ANTHROPIC_BASE_URL") or settings.REASONING_API_BASE

        self.client = Anthropic(
            api_key=self.api_key,
            base_url=self.base_url,
        )

    def generate_intent(
        self,
        screenshots_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Generate workflow intent from screenshots and annotations.

        Args:
            screenshots_data: List of screenshots with annotations
                Each item contains: id, url, annotations (list of {type, x, y, width, height, label, params})

        Returns:
            Dictionary with steps, total_intent, and questions
        """
        context_parts = []
        for idx, shot in enumerate(screenshots_data):
            shot_info = f"\n截图 {idx + 1} (ID: {shot.get('id', 'unknown')}):\n"
            shot_info += f"  URL: {shot.get('url', '')}\n"

            annotations = shot.get("annotations", [])
            if annotations:
                shot_info += "  标注元素:\n"
                for ann in annotations:
                    shot_info += (
                        f"    - [{ann.get('type', 'unknown')}] "
                        f"{ann.get('label', 'Element')} "
                        f"at ({ann.get('x')}, {ann.get('y')}) "
                        f"size {ann.get('width')}x{ann.get('height')}\n"
                    )
            else:
                shot_info += "  无标注元素\n"

            context_parts.append(shot_info)

        context = "\n".join(context_parts)

        prompt = f"""你是一个工作流意图分析助手。根据用户提供的截图和标注信息，分析并生成自动化工作流步骤。

用户提供了以下截图数据：
{context}

请分析这些截图和标注，生成：
1. **steps**: 具体的工作流步骤，每步包含 id, type, url, intent, params
2. **total_intent**: 整体工作流的意图描述（简洁一句话）
3. **questions**: 如果有需要用户确认的问题（如搜索关键词、提取字段等），列出问题列表

步骤类型：start, click, extract, download

请以JSON格式返回结果，格式如下：
{{
  "steps": [
    {{
      "id": "step-1",
      "type": "click",
      "url": "https://...",
      "intent": "点击搜索按钮",
      "params": {{"x": 100, "y": 200}}
    }}
  ],
  "total_intent": "在搜索引擎中搜索关键词并导出结果",
  "questions": [
    {{
      "id": "q-1",
      "q": "搜索关键词是什么？",
      "options": ["AI", "机器学习"],
      "answer": null
    }}
  ]
}}

如果没有问题需要确认，questions 可以为空数组 []。"""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system="你是一个工作流意图分析助手。你必须返回结构化的JSON结果。",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        }
                    ],
                }
            ],
        )

        result_text = ""
        for block in message.content:
            if hasattr(block, "text"):
                result_text += block.text

        try:
            result = json.loads(result_text)
            return {
                "model": self.model,
                "steps": result.get("steps", []),
                "total_intent": result.get("total_intent", ""),
                "questions": result.get("questions", []),
                "usage": {
                    "input_tokens": message.usage.input_tokens,
                    "output_tokens": message.usage.output_tokens,
                },
            }
        except json.JSONDecodeError:
            return {
                "model": self.model,
                "steps": [],
                "total_intent": result_text[:200],
                "questions": [],
                "error": "Failed to parse model response as JSON",
                "raw_response": result_text,
            }

    def refine_intent(
        self,
        workflow_id: str,
        question_id: str,
        answer: str,
        previous_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Refine workflow intent based on user answer to a question.

        Args:
            workflow_id: The workflow ID to refine
            question_id: The question ID that was answered
            answer: The user's answer
            previous_context: Optional previous workflow context

        Returns:
            Updated steps, total_intent, and consumed_questions
        """
        prompt = f"""你是一个工作流细化助手。用户回答了一个问题，请更新工作流。

工作流ID: {workflow_id}
问题ID: {question_id}
用户回答: {answer}

{"previous_context" + json.dumps(previous_context, ensure_ascii=False) if previous_context else ""}

请根据用户的回答更新工作流步骤和整体意图。

请以JSON格式返回：
{{
  "updated_steps": [...],  // 更新后的步骤
  "updated_total_intent": "更新后的整体意图",
  "consumed_questions": ["q-1"]  // 已回答的问题ID列表
}}"""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system="你是一个工作流细化助手。你必须返回结构化的JSON结果。",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        }
                    ],
                }
            ],
        )

        result_text = ""
        for block in message.content:
            if hasattr(block, "text"):
                result_text += block.text

        try:
            result = json.loads(result_text)
            return {
                "model": self.model,
                "updated_steps": result.get("updated_steps", []),
                "updated_total_intent": result.get("updated_total_intent", ""),
                "consumed_questions": result.get("consumed_questions", [question_id]),
                "usage": {
                    "input_tokens": message.usage.input_tokens,
                    "output_tokens": message.usage.output_tokens,
                },
            }
        except json.JSONDecodeError:
            return {
                "model": self.model,
                "updated_steps": [],
                "updated_total_intent": "",
                "consumed_questions": [question_id],
                "error": "Failed to parse model response as JSON",
                "raw_response": result_text,
            }


class ReasoningModelSingleton:
    """Singleton wrapper for ReasoningModel to share across the application."""

    _instance: Optional[ReasoningModel] = None

    @classmethod
    def get_instance(cls) -> ReasoningModel:
        if cls._instance is None:
            cls._instance = ReasoningModel()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        cls._instance = None

# Playwright Executor - Browser automation for workflow execution
import asyncio
import uuid
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum

from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Playwright
from app.services.logger import get_logger
from app.schemas.workflow import StepType

logger = get_logger(__name__)


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class StepResult:
    step_id: str
    status: ExecutionStatus
    output: Optional[dict] = None
    error: Optional[str] = None


@dataclass
class ExecutionResult:
    execution_id: str
    workflow_id: str
    status: ExecutionStatus
    step_results: list[StepResult] = field(default_factory=list)
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class PlaywrightBrowser:
    def __init__(self):
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    async def launch(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        self.page = await self.context.new_page()
        logger.info("Playwright browser launched", extra={"headless": True})

    async def close(self):
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        logger.info("Playwright browser closed")

    async def navigate(self, url: str):
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.goto(url)
        logger.info(f"Navigated to {url}")

    async def click(self, selector: str):
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.click(selector)
        logger.info(f"Clicked element: {selector}")

    async def fill(self, selector: str, text: str):
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.fill(selector, text)
        logger.info(f"Filled text in: {selector}")

    async def wait_for_selector(self, selector: str, timeout: int = 30000):
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.wait_for_selector(selector, timeout=timeout)
        logger.info(f"Waited for selector: {selector}")

    async def wait(self, seconds: float):
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.wait_for_timeout(seconds * 1000)
        logger.info(f"Waited {seconds} seconds")

    async def screenshot(self, path: str, full_page: bool = False) -> dict:
        if not self.page:
            raise RuntimeError("Browser not launched")
        await self.page.screenshot(path=path, full_page=full_page)
        logger.info(f"Screenshot saved: {path}")
        return {"path": path}

    async def extract(self, selector: str, attribute: Optional[str] = None) -> str:
        if not self.page:
            raise RuntimeError("Browser not launched")
        if attribute:
            return await self.page.get_attribute(selector, attribute) or ""
        return await self.page.text_content(selector) or ""

    async def download(self, url: str, path: str):
        async with self.page.request.route(url) as route:
            await route.fulfill(path=path)
        logger.info(f"Downloaded from {url} to {path}")


class WorkflowExecutor:
    def __init__(self):
        self.browser: Optional[PlaywrightBrowser] = None
        self.executions: dict[str, ExecutionResult] = {}

    async def execute_step(self, step: dict) -> StepResult:
        step_id = step.get("id", str(uuid.uuid4()))
        step_type = step.get("type", "")

        try:
            if step_type == StepType.START.value:
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"message": "Workflow started"}
                )

            elif step_type == StepType.NAVIGATE.value:
                url = step.get("params", {}).get("url", "")
                await self.browser.navigate(url)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"url": url}
                )

            elif step_type == StepType.CLICK.value:
                selector = step.get("params", {}).get("selector", "")
                await self.browser.click(selector)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"selector": selector}
                )

            elif step_type == StepType.TYPE.value:
                selector = step.get("params", {}).get("selector", "")
                value = step.get("params", {}).get("value", "")
                await self.browser.fill(selector, value)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"selector": selector, "value": value}
                )

            elif step_type == StepType.WAIT.value:
                seconds = step.get("params", {}).get("seconds", 1)
                await self.browser.wait(seconds)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"seconds": seconds}
                )

            elif step_type == StepType.WAIT_FOR.value:
                selector = step.get("params", {}).get("selector", "")
                timeout = step.get("params", {}).get("timeout", 30000)
                await self.browser.wait_for_selector(selector, timeout)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"selector": "selector"}
                )

            elif step_type == StepType.EXTRACT.value:
                selector = step.get("params", {}).get("selector", "")
                attribute = step.get("params", {}).get("attribute")
                result = await self.browser.extract(selector, attribute)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output={"result": result, "selector": selector}
                )

            elif step_type == StepType.SCREENSHOT.value:
                path = step.get("params", {}).get("path", f"/tmp/screenshot_{step_id}.png")
                full_page = step.get("params", {}).get("full_page", False)
                result = await self.browser.screenshot(path, full_page)
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.COMPLETED,
                    output=result
                )

            else:
                return StepResult(
                    step_id=step_id,
                    status=ExecutionStatus.FAILED,
                    error=f"Unknown step type: {step_type}"
                )

        except Exception as e:
            logger.error(f"Step execution failed: {step_id}", error=str(e))
            return StepResult(
                step_id=step_id,
                status=ExecutionStatus.FAILED,
                error=str(e)
            )

    async def execute_workflow(self, workflow_id: str, steps: list[dict]) -> ExecutionResult:
        from datetime import datetime

        execution_id = str(uuid.uuid4())
        execution = ExecutionResult(
            execution_id=execution_id,
            workflow_id=workflow_id,
            status=ExecutionStatus.RUNNING,
            started_at=datetime.utcnow().isoformat()
        )
        self.executions[execution_id] = execution

        logger.info(f"Starting workflow execution", extra={
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "steps_count": len(steps)
        })

        try:
            self.browser = PlaywrightBrowser()
            await self.browser.launch()

            for step in steps:
                step_result = await self.execute_step(step)
                execution.step_results.append(step_result)

                if step_result.status == ExecutionStatus.FAILED:
                    execution.status = ExecutionStatus.FAILED
                    break

            if execution.status != ExecutionStatus.FAILED:
                execution.status = ExecutionStatus.COMPLETED

        except Exception as e:
            logger.error(f"Workflow execution failed", error=str(e))
            execution.status = ExecutionStatus.FAILED

        finally:
            if self.browser:
                await self.browser.close()

            execution.completed_at = datetime.utcnow().isoformat()
            logger.info(f"Workflow execution completed", extra={
                "execution_id": execution_id,
                "status": execution.status.value
            })

        return execution

    def get_execution(self, execution_id: str) -> Optional[ExecutionResult]:
        return self.executions.get(execution_id)


# Global executor instance
workflow_executor = WorkflowExecutor()

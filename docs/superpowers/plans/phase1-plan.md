# SPEC - Phase 1 实现计划

> 状态：草稿
> 创建：2026-04-28
> 基于：docs/superpowers/specs/2026-04-28-design.md

---

## 1. 阶段目标

**Phase 1：核心骨架（Week 1-4）**

最小可运行版本：
- 用户上传截图 + URL
- AI 生成意图（可微调）
- AI 生成工作流（JSON）
- 画布展示工作流
- 导出 JSON

---

## 2. 目录结构

```
SPEC/
├── frontend/                      # React SPA (npm)
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/           # 画布编辑器
│   │   │   ├── screenshot/       # 截图标注
│   │   │   ├── workflow/         # 工作流列表
│   │   │   └── results/          # 结果展示
│   │   ├── stores/               # Zustand
│   │   ├── api/                  # API 客户端
│   │   └── App.tsx
│   └── package.json
│
├── backend/                       # FastAPI (pip)
│   ├── app/
│   │   ├── api/routes/           # API 路由
│   │   ├── core/                 # 核心模块
│   │   │   ├── executor.py
│   │   │   ├── workflow_manager.py
│   │   │   └── intent_analyzer.py
│   │   ├── models/               # 数据模型
│   │   ├── schemas/              # Pydantic
│   │   ├── services/             # 服务层
│   │   └── main.py
│   ├── plugins/                  # 插件目录（预留）
│   └── requirements.txt
│
├── docs/
│   ├── specs/
│   │   └── 2026-04-28-design.md
│   └── plans/
│       └── phase1-plan.md        # 本文档
│
├── .env.example                   # 环境变量模板
├── .claude/
│   └── settings.json
└── CLAUDE.md
```

---

## 3. 任务分解

### Week 1：项目脚手架

| # | 任务 | 负责人 | 产出 | 依赖 |
|---|------|--------|------|------|
| 1.1 | 前端项目初始化 | frontend-dev | React + Vite + TypeScript + Tailwind + React Flow + Zustand | - |
| 1.2 | 后端项目初始化 | backend-dev | FastAPI + SQLite + Pydantic | - |
| 1.3 | 前端目录结构 | frontend-dev | 按设计文档创建组件目录 | 1.1 |
| 1.4 | 后端目录结构 | backend-dev | 按设计文档创建目录 + 基础路由 | 1.2 |
| 1.5 | 环境变量配置 | backend-dev | .env.example + env 加载逻辑 | - |
| 1.6 | API 契约文档 | backend-dev | docs/api-contracts.md | - |

### Week 2：数据模型 + JSON Schema

| # | 任务 | 负责人 | 产出 | 依赖 |
|---|------|--------|------|------|
| 2.1 | 工作流 JSON Schema | backend-dev | workflow.schema.json + Pydantic models | 1.2 |
| 2.2 | 数据库模型 | backend-dev | SQLite models (workflow, screenshot, execution) | 2.1 |
| 2.3 | 工作流 CRUD API | backend-dev | /api/workflows 路由完整 | 2.2 |
| 2.4 | 前端 Zustand stores | frontend-dev | workflowStore, screenshotStore, intentStore | 1.1 |
| 2.5 | 前端 API 客户端 | frontend-dev | API client 封装 + 错误处理 | 1.1, 3.1 |

### Week 3：截图系统 + 标注工具

| # | 任务 | 负责人 | 产出 | 依赖 |
|---|------|--------|------|------|
| 3.1 | 截图上传 API | backend-dev | POST /api/screenshots/upload | 2.3 |
| 3.2 | 截图预览组件 | frontend-dev | UploadZone + 缩略图列表 | 1.3 |
| 3.3 | 标注画布组件 | frontend-dev | AnnotationCanvas（三画笔模式） | 3.2 |
| 3.4 | 标注数据模型 | frontend-dev | annotations 数据结构定义 | 3.3 |
| 3.5 | 截图-步骤关联 | backend-dev | screenshot 表 + workflow 关联 | 3.1, 2.2 |

### Week 4：AI 意图生成 + 画布集成

| # | 任务 | 负责人 | 产出 | 依赖 |
|---|------|--------|------|------|
| 4.1 | 模型调用封装 | backend-dev | vision_model.py + reasoning_model.py | 1.5 |
| 4.2 | 意图生成 API | backend-dev | POST /api/intent/generate | 4.1, 3.1 |
| 4.3 | 意图编辑器组件 | frontend-dev | IntentEditor（单步 + 总意图） | 3.3 |
| 4.4 | React Flow 画布 | frontend-dev | Canvas.tsx + 基础节点渲染 | 2.4 |
| 4.5 | 工作流导出 | backend-dev | GET /api/workflows/{id}/export | 2.3 |
| 4.6 | Phase 1 联调 | 所有人 | 前后端联调测试 | 4.2, 4.3, 4.4 |

---

## 4. 关键文件清单

### 4.1 后端关键文件

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI 入口
│   ├── config.py                  # 环境变量加载
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── workflows.py       # 工作流 CRUD
│   │       ├── screenshots.py     # 截图上传
│   │       ├── intents.py         # 意图生成
│   │       └── execute.py         # 执行控制
│   ├── core/
│   │   ├── __init__.py
│   │   ├── executor.py            # 执行引擎（预留）
│   │   ├── workflow_manager.py    # 工作流管理
│   │   ├── intent_analyzer.py     # AI 意图分析
│   │   └── models/
│   │       ├── vision_model.py    # 视觉模型调用
│   │       └── reasoning_model.py # 推理模型调用
│   ├── models/
│   │   ├── __init__.py
│   │   ├── workflow.py
│   │   ├── screenshot.py
│   │   └── execution.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── workflow.py            # Pydantic schemas
│   └── services/
│       ├── __init__.py
│       └── output_generator.py    # 输出生成（预留）
```

### 4.2 前端关键文件

```
frontend/src/
├── App.tsx                        # 入口
├── main.tsx                       # React 入口
├── api/
│   ├── client.ts                  # API 客户端
│   └── types.ts                   # API 类型定义
├── stores/
│   ├── workflowStore.ts           # 工作流状态
│   ├── screenshotStore.ts         # 截图状态
│   └── intentStore.ts             # 意图状态
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx             # React Flow 画布
│   │   ├── Toolbar.tsx            # 顶部工具栏
│   │   ├── NodePanel.tsx          # 左侧节点面板
│   │   ├── PropertyPanel.tsx      # 右侧属性面板
│   │   └── nodes/
│   │       ├── BaseNode.tsx
│   │       ├── StartNode.tsx
│   │       ├── ClickNode.tsx
│   │       ├── ExtractNode.tsx
│   │       └── DownloadNode.tsx
│   ├── screenshot/
│   │   ├── UploadZone.tsx         # 上传区域
│   │   ├── ScreenshotList.tsx     # 截图列表
│   │   ├── AnnotationCanvas.tsx   # 标注画布
│   │   └── tools/
│   │       ├── BaseTool.ts
│   │       ├── ClickTool.tsx
│   │       ├── ExtractTool.tsx
│   │       └── DownloadTool.tsx
│   ├── workflow/
│   │   ├── WorkflowList.tsx       # 历史工作流
│   │   ├── WorkflowDetail.tsx
│   │   ├── IntentEditor.tsx       # 意图编辑器
│   │   └── JsonEditor.tsx         # JSON 编辑器
│   └── results/
│       ├── DataTable.tsx
│       └── ExportPanel.tsx
```

---

## 5. API 路由详情

### 5.1 工作流路由

```
GET    /api/workflows              # 列表
POST   /api/workflows              # 创建
GET    /api/workflows/{id}         # 详情
PUT    /api/workflows/{id}         # 更新
DELETE /api/workflows/{id}         # 删除
GET    /api/workflows/{id}/export  # 导出 JSON
POST   /api/workflows/{id}/import  # 导入 JSON
```

### 5.2 截图路由

```
POST   /api/screenshots/upload     # 上传截图
        Request: multipart/form-data
        Body: { file, workflow_id?, step_order? }
        Response: { id, url, path, width, height }
```

### 5.3 意图路由

```
POST   /api/intent/generate        # 生成意图
        Request: { screenshots: [{ id, url, annotations }] }
        Response: {
          steps: [{ id, url, intent, type }],
          totalIntent: string,
          questions?: [{ q, options }]
        }

POST   /api/intent/refine          # 细化意图（用户回答后）
        Request: { question_id, answer }
        Response: { updated_steps, updated_total_intent }
```

---

## 6. 环境变量配置

```env
# .env.example

# 服务配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 数据库
DATABASE_URL=sqlite:///./spec.db

# 视觉模型（用于截图理解）
VISION_MODEL=minimax/video-01
VISION_API_KEY=your_vision_api_key
VISION_API_BASE=https://api.minimax.com

# 推理模型（用于意图生成）
REASONING_MODEL=minimax/moe-01
REASONING_API_KEY=your_reasoning_api_key
REASONING_API_BASE=https://api.minimax.com

# 文件存储
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
```

---

## 7. Agent 并行工作指南

### 7.1 并行启动条件

Week 1 完成后，可以同时启动：
- **backend-dev**：开发后端 API
- **frontend-dev**：开发前端组件

### 7.2 共享契约

前后端共享 `docs/api-contracts.md`，任何 API 变更必须同步更新该文档。

### 7.3 联调节点

Week 1 末、Week 2 末、Week 3 末进行三次集成检查。

---

## 8. 验收标准

### Phase 1 验收

- [ ] 前端可以启动 (npm run dev)
- [ ] 后端可以启动 (uvicorn app.main:app)
- [ ] 上传截图到后端
- [ ] 调用 MiniMax 生成意图
- [ ] 画布显示工作流节点
- [ ] 导出工作流为 JSON
- [ ] 所有 API 符合 docs/api-contracts.md

---

## 9. 下一步

1. 确认计划
2. 初始化 Git 仓库
3. 创建 .env.example
4. 启动 Week 1 任务
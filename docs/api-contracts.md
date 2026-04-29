# API 契约文档

> SnapFlow 项目前后端共享的 API 定义
> 版本: v1.0.0
> 更新: 2026-04-28

---

## 目录

- [1. 工作流 API](#1-工作流-api)
- [2. 截图 API](#2-截图-api)
- [3. 意图 API](#3-意图-api)
- [4. 数据模型](#4-数据模型)

---

## 1. 工作流 API

### 1.1 列表

```
GET /api/workflows
```

**Response 200**
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "status": "draft|running|completed|failed",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

### 1.2 创建

```
POST /api/workflows
```

**Request**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "draft",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 1.3 详情

```
GET /api/workflows/{id}
```

**Response 200**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "draft|running|completed|failed",
  "steps": [...],
  "total_intent": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 1.4 更新

```
PUT /api/workflows/{id}
```

**Request**
```json
{
  "name": "string",
  "description": "string",
  "steps": [...],
  "total_intent": "string"
}
```

**Response 200**
```json
{
  "id": "uuid",
  "name": "string",
  "status": "draft",
  ...
}
```

### 1.5 删除

```
DELETE /api/workflows/{id}
```

**Response 204** No Content

### 1.6 导出

```
GET /api/workflows/{id}/export
```

**Response 200**
```json
{
  "version": "1.0",
  "id": "uuid",
  "name": "string",
  "steps": [
    {
      "id": "step-1",
      "type": "start|click|extract|download",
      "url": "string",
      "intent": "string",
      "params": {},
      "annotations": []
    }
  ],
  "total_intent": "string"
}
```

### 1.7 导入

```
POST /api/workflows/{id}/import
```

**Request** (JSON body)
```json
{
  "version": "1.0",
  "name": "string",
  "steps": [...],
  "total_intent": "string"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "name": "string",
  ...
}
```

---

## 2. 截图 API

### 2.1 上传截图

```
POST /api/screenshots/upload
```

**Request** (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | 图片文件 (PNG/JPG/WebP) |
| workflow_id | UUID | No | 关联的工作流 ID |
| step_order | int | No | 步骤顺序 |

**Response 201**
```json
{
  "id": "uuid",
  "url": "/uploads/xxx.png",
  "path": "./uploads/xxx.png",
  "width": 1920,
  "height": 1080,
  "workflow_id": "uuid",
  "step_order": 1
}
```

### 2.2 获取截图

```
GET /api/screenshots/{id}
```

**Response 200**
```json
{
  "id": "uuid",
  "url": "/uploads/xxx.png",
  "path": "./uploads/xxx.png",
  "width": 1920,
  "height": 1080,
  "workflow_id": "uuid",
  "step_order": 1,
  "annotations": []
}
```

### 2.3 更新标注

```
PUT /api/screenshots/{id}/annotations
```

**Request**
```json
{
  "annotations": [
    {
      "id": "ann-1",
      "type": "click|extract|download",
      "x": 100,
      "y": 200,
      "width": 50,
      "height": 30,
      "label": "string",
      "params": {}
    }
  ]
}
```

**Response 200**
```json
{
  "id": "uuid",
  "annotations": [...]
}
```

---

## 3. 意图 API

### 3.1 生成意图

```
POST /api/intent/generate
```

**Request**
```json
{
  "screenshots": [
    {
      "id": "uuid",
      "url": "/uploads/xxx.png",
      "annotations": [
        {
          "type": "click|extract|download",
          "x": 100,
          "y": 200,
          "width": 50,
          "height": 30,
          "label": "string",
          "params": {}
        }
      ]
    }
  ]
}
```

**Response 200**
```json
{
  "steps": [
    {
      "id": "step-1",
      "screenshot_id": "uuid",
      "url": "/uploads/xxx.png",
      "type": "click|extract|download",
      "intent": "点击搜索按钮",
      "params": {
        "x": 100,
        "y": 200
      }
    }
  ],
  "total_intent": "在搜索引擎中搜索关键词，获取结果列表并导出",
  "questions": [
    {
      "id": "q-1",
      "q": "搜索关键词是什么？",
      "options": ["AI", "机器学习", "深度学习"],
      "answer": null
    }
  ]
}
```

### 3.2 细化意图

```
POST /api/intent/refine
```

**Request**
```json
{
  "workflow_id": "uuid",
  "question_id": "q-1",
  "answer": "AI"
}
```

**Response 200**
```json
{
  "updated_steps": [...],
  "updated_total_intent": "在搜索引擎中搜索 AI，获取结果列表并导出",
  "consumed_questions": ["q-1"]
}
```

---

## 4. 数据模型

### 4.1 Workflow

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "draft|running|completed|failed",
  "steps": "json",        // Step[]
  "total_intent": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 4.2 Screenshot

```json
{
  "id": "uuid",
  "url": "string",
  "path": "string",
  "width": "int",
  "height": "int",
  "workflow_id": "uuid|null",
  "step_order": "int|null",
  "annotations": "json",  // Annotation[]
  "created_at": "datetime"
}
```

### 4.3 Step

```json
{
  "id": "step-1",
  "type": "start|click|extract|download",
  "url": "string",
  "intent": "string",
  "params": {},
  "annotations": []
}
```

### 4.4 Annotation

```json
{
  "id": "ann-1",
  "type": "click|extract|download",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "label": "string",
  "params": {}
}
```

### 4.5 Question

```json
{
  "id": "q-1",
  "q": "string",
  "options": ["string"],
  "answer": "string|null"
}
```

---

## 5. 错误响应

### 5.1 标准错误格式

```json
{
  "detail": "错误描述",
  "code": "ERROR_CODE"
}
```

### 5.2 错误码

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | INVALID_REQUEST | 请求参数无效 |
| 404 | NOT_FOUND | 资源不存在 |
| 422 | VALIDATION_ERROR | Pydantic 验证失败 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 6. 认证 (预留)

> Phase 2 实现

```
Authorization: Bearer <token>
```

---

## 7. 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-04-28 | v1.0.0 | 初始版本 |

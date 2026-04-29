# MiniMax 模型文档 (中文版)

> SnapFlow 项目使用的 AI 模型配置指南
> 更新: 2026-04-28

---

## 1. 快速开始

### 1.1 安装 SDK

```bash
# Python
pip install anthropic

# Node.js
npm install @anthropic-ai/sdk
```

### 1.2 配置环境变量

```bash
export ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
export ANTHROPIC_API_KEY=your_api_key_here
```

### 1.3 调用示例 (Python)

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="MiniMax-M2.7",
    max_tokens=1000,
    system="你是一个有用的助手。",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "你好，帮我解释一下这个网页的结构。"
                }
            ]
        }
    ]
)

for block in message.content:
    if block.type == "thinking":
        print(f"推理过程:\n{block.thinking}\n")
    elif block.type == "text":
        print(f"回复:\n{block.text}\n")
```

---

## 2. 支持的模型

| 模型名称 | 上下文窗口 | 输出速度 | 适用场景 |
|---------|----------|---------|---------|
| **MiniMax-M2.7** | 204,800 | ~60 TPS | 通用任务、复杂推理 |
| **MiniMax-M2.7-highspeed** | 204,800 | ~100 TPS | M2.7 极速版，效果不变 |
| **MiniMax-M2.5** | 204,800 | ~60 TPS | 顶尖性能与极致性价比 |
| **MiniMax-M2.5-highspeed** | 204,800 | ~100 TPS | M2.5 极速版，效果不变 |
| **MiniMax-M2.1** | 204,800 | ~60 TPS | 强大多语言编程能力 |
| **MiniMax-M2.1-highspeed** | 204,800 | ~100 TPS | M2.1 极速版，效果不变 |
| **MiniMax-M2** | 204,800 | ~60 TPS | 专为高效编码与 Agent 工作流 |

> TPS = Tokens Per Second (每秒输出 token 数)

---

## 3. 模型选择建议

### SnapFlow 中的使用

| 用途 | 推荐模型 | 理由 |
|------|---------|------|
| **视觉理解 (截图)** | MiniMax-M2.7 | 大上下文，复杂页面结构理解 |
| **意图生成** | MiniMax-M2.7 | 强推理能力，理解用户意图 |
| **工作流生成** | MiniMax-M2.7 | 复杂决策和规划 |
| **快速测试/预览** | MiniMax-M2.7-highspeed | 高速度，调试时使用 |

---

## 4. 支持的参数

| 参数 | 支持状态 | 说明 |
|------|---------|------|
| `model` | ✅ 完全支持 | 模型名称 |
| `messages` | ✅ 部分支持 | 仅支持文本和工具调用 |
| `max_tokens` | ✅ 完全支持 | 最大生成 token 数 |
| `stream` | ✅ 完全支持 | 流式响应 |
| `system` | ✅ 完全支持 | 系统提示词 |
| `temperature` | ✅ 完全支持 | 取值范围 (0.0, 1.0]，**推荐 1.0** |
| `tool_choice` | ✅ 完全支持 | 工具选择策略 |
| `tools` | ✅ 完全支持 | 工具定义 |
| `top_p` | ✅ 完全支持 | 核采样参数 |
| `thinking` | ✅ 完全支持 | 推理内容输出 |
| `top_k` | ⚪ 忽略 | 会忽略此参数 |
| `stop_sequences` | ⚪ 忽略 | 会忽略此参数 |
| `mcp_servers` | ⚪ 忽略 | 会忽略此参数 |

---

## 5. Messages 字段支持

| 字段类型 | 支持状态 |
|---------|---------|
| `type="text"` | ✅ 支持 |
| `type="tool_use"` | ✅ 支持 |
| `type="tool_result"` | ✅ 支持 |
| `type="thinking"` | ✅ 支持 |
| `type="image"` | ❌ 不支持 |
| `type="document"` | ❌ 不支持 |

---

## 6. 注意事项

1. **温度参数**: 推荐使用 `temperature=1.0`，超出范围会返回错误
2. **多轮对话**: Function Call 对话中，必须将完整的 `response.content` 添加到消息历史以保持思维链连续性
3. **图像输入**: 当前不支持图像和文档类型的输入
4. **工具调用**: 支持工具调用，但不支持带图像/文档的工具输入

---

## 7. 流式输出示例

```python
import anthropic

client = anthropic.Anthropic()

stream = client.messages.create(
    model="MiniMax-M2.7",
    max_tokens=1000,
    system="你是一个有用的助手。",
    messages=[
        {"role": "user", "content": [{"type": "text", "text": "你好"}]}
    ],
    stream=True,
)

for chunk in stream:
    if chunk.type == "content_block_delta":
        if chunk.delta.type == "thinking_delta":
            print(chunk.delta.thinking, end="", flush=True)
        elif chunk.delta.type == "text_delta":
            print(chunk.delta.text, end="", flush=True)
```

---

## 8. 错误处理

常见错误码：

| HTTP Status | Code | 说明 |
|-------------|------|------|
| 401 | 认证失败 | API Key 无效或过期 |
| 400 | 参数错误 | 请求参数超出范围 |
| 429 | 请求过多 | 超出速率限制 |
| 500 | 服务器错误 | MiniMax 服务端问题 |

如遇问题联系: Model@minimaxi.com 或 [GitHub Issues](https://github.com/MiniMax-AI/MiniMax-M2/issues)

---

## 9. SnapFlow 中的配置

在 `.env` 文件中配置：

```bash
# Anthropic 兼容模式
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
ANTHROPIC_API_KEY=your_api_key_here

# 模型选择
VISION_MODEL=MiniMax-M2.7
REASONING_MODEL=MiniMax-M2.7
```

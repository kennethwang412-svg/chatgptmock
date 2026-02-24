# DeepSeek API 接口字段记录

> 测试时间: 2026-02-24
> 测试脚本: test_deepseek.py

## 统一接入方式

统一使用 `model="deepseek-chat"` 接入：
- **普通对话**：直接调用，不传 `extra_body`
- **思考模式**：传 `extra_body={"thinking": {"type": "enabled"}}`

```python
from openai import OpenAI
client = OpenAI(api_key="sk-xxx", base_url="https://api.deepseek.com")
```

---

## 测试1: 普通对话模式

**调用参数**：`model="deepseek-chat"`, 无 extra_body

### Chunk 结构

```
chunk.id          = "7dfd2e30-aa3e-48db-bea2-a8c9c3720a06"  (整个流共用同一个 id)
chunk.model       = "deepseek-chat"
chunk.object      = "chat.completion.chunk"
chunk.created     = 1771918054  (unix timestamp)
chunk.choices[0]:
  .index          = 0
  .finish_reason  = None | "stop"
  .delta:
    .role             = "assistant" (仅第1个chunk) | None (后续)
    .content          = "" | "token文本"
    .reasoning_content = 不存在 (getattr 返回 N/A)
```

### 流序列

| 阶段 | chunk# | delta.role | delta.content | delta.reasoning_content | finish_reason |
|------|--------|-----------|--------------|------------------------|--------------|
| 开始 | 1 | "assistant" | "" | N/A (不存在) | None |
| 内容 | 2~31 | None | "token..." | N/A (不存在) | None |
| 结束 | 32 | None | "" | N/A (不存在) | "stop" |

**关键发现**：普通模式下 `delta` 对象上**没有** `reasoning_content` 属性。

---

## 测试2: 思考模式

**调用参数**：`model="deepseek-chat"`, `extra_body={"thinking": {"type": "enabled"}}`

### Chunk 结构

```
chunk.id          = "6364f9e1-5f8c-40cb-9e1d-6263a941c56a"
chunk.model       = "deepseek-reasoner"  ← 注意：返回的 model 变成了 deepseek-reasoner
chunk.object      = "chat.completion.chunk"
chunk.created     = 1771918057
chunk.choices[0]:
  .index          = 0
  .finish_reason  = None | "stop"
  .delta:
    .role               = "assistant" (仅第1个chunk) | None
    .content            = None (思考阶段) | "token文本" (回答阶段) | "" (最后)
    .reasoning_content  = "" | "思考token..." (思考阶段) | None (回答阶段)
```

### 流序列 (244 chunks)

| 阶段 | chunk# | delta.content | delta.reasoning_content | finish_reason |
|------|--------|--------------|------------------------|--------------|
| 开始 | 1 | None | "" | None |
| 思考 | 2~183 | None | "思考token..." | None |
| **切换点** | **184** | **"9"** | **None** | None |
| 回答 | 185~243 | "回答token..." | None | None |
| 结束 | 244 | "" | None | "stop" |

### 关键发现

1. **返回 model 变化**：即使请求 `model="deepseek-chat"`，开启 thinking 后返回的 `chunk.model` 是 `"deepseek-reasoner"`
2. **两阶段明确分离**：
   - 思考阶段: `reasoning_content` 有值, `content` 为 `None`
   - 回答阶段: `content` 有值, `reasoning_content` 为 `None`
3. **切换判断逻辑**: 当 `reasoning_content` 从有值变为 `None` 且 `content` 不为 `None` 时，表示切换到回答阶段
4. **首个 chunk**: `role="assistant"`, `content=None`, `reasoning_content=""`
5. **最后 chunk**: `finish_reason="stop"`, `content=""`, `reasoning_content=None`

---

## 测试3: 多轮对话 (思考模式)

多轮对话时 messages 格式：

```python
messages = [
    {"role": "user", "content": "第一个问题"},
    {"role": "assistant", "content": "第一轮的回答内容"},  # 只放 content，不放 reasoning_content
    {"role": "user", "content": "第二个问题"},
]
```

结果：108 chunks, 164字思考 + 30字回答，流结构与测试2一致。

---

## 后端 SSE 设计要点

基于以上测试结果，后端 SSE 推送格式应为：

```
# 思考模式
data: {"type": "reasoning", "content": "思考token..."}
data: {"type": "reasoning", "content": "更多思考..."}
data: {"type": "content", "content": "回答token..."}
data: {"type": "content", "content": "更多回答..."}
data: {"type": "done"}

# 普通模式
data: {"type": "content", "content": "回答token..."}
data: {"type": "content", "content": "更多回答..."}
data: {"type": "done"}
```

### 前端消费逻辑

```
if type === "reasoning" → 追加到 message.reasoning_content
if type === "content"   → 追加到 message.content
if type === "done"      → 标记流结束
```

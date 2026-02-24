import type { Conversation, Message } from '../types'

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: '什么是量子计算？',
    created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-02-24T10:05:00Z',
  },
  {
    id: 'conv-2',
    title: '用 Python 写快速排序',
    created_at: '2026-02-23T14:00:00Z',
    updated_at: '2026-02-23T14:10:00Z',
  },
  {
    id: 'conv-3',
    title: 'React vs Vue 对比分析',
    created_at: '2026-02-22T09:00:00Z',
    updated_at: '2026-02-22T09:20:00Z',
  },
]

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user',
      content: '请帮我解释一下量子计算的基本原理',
      created_at: '2026-02-24T10:00:00Z',
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: `## 量子计算基本原理

量子计算是利用**量子力学**特性来处理信息的计算方式。

### 核心概念

1. **量子比特 (Qubit)**：与经典比特只能是 0 或 1 不同，量子比特可以同时处于 0 和 1 的叠加态
2. **叠加态**：量子比特可以同时表示多个状态
3. **量子纠缠**：两个量子比特之间可以建立关联

### 优势

- 并行计算能力强
- 特定问题上指数级加速
- 密码学、药物研发等领域潜力巨大

> 量子计算不是替代经典计算，而是在特定问题上提供加速。`,
      reasoning_content: `用户问的是量子计算的基本原理，我需要从几个核心概念来解释：

1. 首先解释量子比特和经典比特的区别
2. 然后介绍叠加态和量子纠缠
3. 最后说一下优势和应用场景

让我组织一下语言，用通俗易懂的方式来说明...`,
      model: 'deepseek-reasoner',
      created_at: '2026-02-24T10:01:00Z',
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      conversation_id: 'conv-2',
      role: 'user',
      content: '用 Python 实现快速排序算法',
      created_at: '2026-02-23T14:00:00Z',
    },
    {
      id: 'msg-4',
      conversation_id: 'conv-2',
      role: 'assistant',
      content: `下面是 Python 实现的快速排序：

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# 使用示例
nums = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(nums))  # [1, 1, 2, 3, 6, 8, 10]
\`\`\`

时间复杂度：平均 \`O(n log n)\`，最坏 \`O(n²)\`。`,
      model: 'deepseek-chat',
      created_at: '2026-02-23T14:01:00Z',
    },
    {
      id: 'msg-5',
      conversation_id: 'conv-2',
      role: 'user',
      content: '能不能用原地排序的方式实现？',
      created_at: '2026-02-23T14:05:00Z',
    },
    {
      id: 'msg-6',
      conversation_id: 'conv-2',
      role: 'assistant',
      content: `当然可以，下面是原地快速排序的实现：

\`\`\`python
def quicksort_inplace(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quicksort_inplace(arr, low, pi - 1)
        quicksort_inplace(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
\`\`\`

这个版本的空间复杂度为 \`O(log n)\`（递归栈），不需要额外数组。`,
      reasoning_content: `用户想要原地排序的版本。原地快排的关键在于 partition 函数：

1. 选择最后一个元素作为 pivot
2. 维护一个指针 i，表示小于等于 pivot 的区域的右边界
3. 遍历数组，将小于 pivot 的元素交换到左边
4. 最后将 pivot 放到正确位置

这样就不需要创建新数组了，空间复杂度从 O(n) 降到 O(log n)。`,
      model: 'deepseek-reasoner',
      created_at: '2026-02-23T14:06:00Z',
    },
  ],
  'conv-3': [
    {
      id: 'msg-7',
      conversation_id: 'conv-3',
      role: 'user',
      content: 'React 和 Vue 的主要区别是什么？',
      created_at: '2026-02-22T09:00:00Z',
    },
    {
      id: 'msg-8',
      conversation_id: 'conv-3',
      role: 'assistant',
      content: `## React vs Vue 对比

| 特性 | React | Vue |
|------|-------|-----|
| 学习曲线 | 较陡 | 较平缓 |
| 模板语法 | JSX | HTML 模板 |
| 状态管理 | useState/Redux | ref/reactive/Pinia |
| 生态系统 | 非常丰富 | 丰富 |
| 性能 | 优秀 | 优秀 |

**总结**：两者都是优秀的框架，React 更灵活，Vue 更易上手。选择取决于团队经验和项目需求。`,
      model: 'deepseek-chat',
      created_at: '2026-02-22T09:01:00Z',
    },
  ],
}

const streamingDemo = `这是一个**流式输出**的演示。

我正在逐步生成内容，就像真正的 AI 对话一样。

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

是不是很酷？`

const reasoningDemo = `让我仔细思考一下这个问题...

首先，我需要理解用户的需求，然后逐步分析可能的解决方案。

这涉及到几个方面：
1. 技术可行性
2. 实现复杂度
3. 用户体验`

export function simulateStreaming(
  mode: 'chat' | 'reasoner',
  onReasoningToken?: (token: string) => void,
  onContentToken?: (token: string) => void,
  onDone?: () => void,
) {
  const contentTokens = streamingDemo.split('')
  const reasoningTokens = reasoningDemo.split('')
  let idx = 0

  if (mode === 'reasoner' && onReasoningToken) {
    const reasoningInterval = setInterval(() => {
      if (idx < reasoningTokens.length) {
        onReasoningToken(reasoningTokens[idx])
        idx++
      } else {
        clearInterval(reasoningInterval)
        idx = 0
        const contentInterval = setInterval(() => {
          if (idx < contentTokens.length) {
            onContentToken?.(contentTokens[idx])
            idx++
          } else {
            clearInterval(contentInterval)
            onDone?.()
          }
        }, 20)
      }
    }, 15)
  } else {
    const contentInterval = setInterval(() => {
      if (idx < contentTokens.length) {
        onContentToken?.(contentTokens[idx])
        idx++
      } else {
        clearInterval(contentInterval)
        onDone?.()
      }
    }, 20)
  }
}

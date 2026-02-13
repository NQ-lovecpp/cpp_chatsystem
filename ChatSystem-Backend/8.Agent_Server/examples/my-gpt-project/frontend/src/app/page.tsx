'use client';

import type { AgentInputItem, RunToolApprovalItem } from '@openai/agents';
import { useState, useCallback, useRef, useEffect } from 'react';
import { App } from '@/components/App';
import { Approvals } from '@/components/Approvals';

// 流式事件类型
type StreamEvent =
  | { type: 'init'; data: { conversationId: string } }
  | { type: 'text_delta'; data: { delta: string } }
  | { type: 'reasoning_delta'; data: { delta: string } }
  | { type: 'reasoning_item'; data: { text: string } }
  | { type: 'tool_call'; data: { name: string; arguments: string; callId: string; status: string } }
  | { type: 'tool_output'; data: { callId: string; output: string; status: string } }
  | { type: 'message'; data: { role: string; content: string } }
  | { type: 'agent_update'; data: { agent: string } }
  | { type: 'interruption'; data: { approvals: any[]; history: AgentInputItem[] } }
  | { type: 'done'; data: { response: string; history: AgentInputItem[] } }
  | { type: 'error'; data: { error: string } };

export default function Home() {
  const [history, setHistory] = useState<AgentInputItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<
    ReturnType<RunToolApprovalItem['toJSON']>[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');

  // 用于跟踪当前的工具调用
  const pendingToolCalls = useRef<Map<string, any>>(new Map());
  // 用于在 done 事件中访问 reasoning 内容
  const currentReasoningRef = useRef<string>('');
  // 用于存储历史消息的 reasoning（按消息 id 或索引）
  const reasoningMapRef = useRef<Map<string, string>>(new Map());
  // 用于追踪 reasoning 是否已保存到 history（避免重复显示）
  const reasoningSavedRef = useRef<boolean>(false);

  // 页面加载时预热 Agent 与 MCP 连接，避免首条消息触发 "Received request before initialization was complete"
  useEffect(() => {
    fetch('/api/agent/init').catch(() => {});
  }, []);

  const processStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'init':
        setConversationId(event.data.conversationId);
        break;

      case 'text_delta':
        // 累积文本增量（打字机效果）
        setStreamingText(prev => prev + event.data.delta);
        break;

      case 'reasoning_delta':
        // 如果之前的 reasoning 已保存到 history，开始新的 reasoning
        if (reasoningSavedRef.current) {
          reasoningSavedRef.current = false;
          setStreamingReasoning(event.data.delta);
          currentReasoningRef.current = event.data.delta;
        } else {
          setStreamingReasoning(prev => {
            const newValue = prev + event.data.delta;
            currentReasoningRef.current = newValue;
            return newValue;
          });
        }
        break;

      case 'reasoning_item':
        // 完整的 reasoning 内容（非增量）
        setStreamingReasoning(prev => {
          const newValue = prev ? prev + '\n' + event.data.text : event.data.text;
          currentReasoningRef.current = newValue;
          return newValue;
        });
        break;

      case 'tool_call':
        // 添加工具调用到历史
        pendingToolCalls.current.set(event.data.callId, event.data);
        
        // 先保存当前的 reasoning 到 ref（在 setHistory 之前）
        const reasoningToSave = currentReasoningRef.current;
        
        setHistory(prev => {
          // 检查是否已经存在这个工具调用
          const existing = prev.find(
            item => item.type === 'function_call' && (item as any).callId === event.data.callId
          );
          if (existing) return prev;

          // 过滤掉占位消息
          const filtered = prev.filter(item => {
            if (item.type === 'message' && item.role === 'assistant') {
              const content = item.content;
              return !(Array.isArray(content) && content.length === 0);
            }
            return true;
          });

          const newItems: AgentInputItem[] = [...filtered];
          
          // 如果有累积的 reasoning，先作为独立 item 插入（在 tool call 之前）
          if (reasoningToSave) {
            newItems.push({
              type: 'reasoning_item',
              content: reasoningToSave,
              id: `reasoning-${Date.now()}`,
            } as unknown as AgentInputItem);
          }
          
          // 添加 tool call
          newItems.push({
            type: 'function_call',
            name: event.data.name,
            arguments: event.data.arguments,
            callId: event.data.callId,
            id: event.data.callId,
          } as unknown as AgentInputItem);
          
          return newItems;
        });
        
        // reasoning 已保存到 history，清空当前显示
        if (reasoningToSave) {
          reasoningSavedRef.current = true;
          currentReasoningRef.current = '';
          setStreamingReasoning('');
        }
        break;

      case 'tool_output':
        // 更新工具调用结果
        setHistory(prev => {
          const newHistory = [...prev];
          // 添加函数调用结果
          newHistory.push({
            type: 'function_call_result',
            callId: event.data.callId,
            output: event.data.output,
          } as AgentInputItem);
          return newHistory;
        });
        pendingToolCalls.current.delete(event.data.callId);
        break;

      case 'message':
        // 添加消息到历史
        setStreamingText('');
        setStreamingReasoning('');
        break;

      case 'agent_update':
        // 可以用来显示当前活动的 agent
        break;

      case 'interruption':
        // 需要审批 - 保留所有历史 reasoning，按正确位置插入
        const interruptCurrentReasoning = currentReasoningRef.current;
        
        setHistory(prev => {
          const serverHistory = [...event.data.history];
          const mergedHistory: AgentInputItem[] = [];
          
          // 从 prev 中构建 reasoning 位置映射（与 done 事件相同逻辑）
          const reasoningBeforeCall = new Map<string, AgentInputItem>();
          let firstReasoning: AgentInputItem | null = null;
          let foundFirstCall = false;
          let lastReasoning: AgentInputItem | null = null;
          
          for (let i = 0; i < prev.length; i++) {
            const item = prev[i];
            if ((item as any).type === 'reasoning_item') {
              let foundCall = false;
              for (let j = i + 1; j < prev.length; j++) {
                if (prev[j].type === 'function_call') {
                  const callId = (prev[j] as any).callId;
                  reasoningBeforeCall.set(callId, item);
                  foundCall = true;
                  foundFirstCall = true;
                  break;
                }
                if ((prev[j] as any).type === 'reasoning_item') break;
              }
              if (!foundCall) {
                if (!foundFirstCall) {
                  firstReasoning = item;
                } else {
                  lastReasoning = item;
                }
              }
            }
          }
          
          const insertedReasonings = new Set<AgentInputItem>();
          
          for (let i = 0; i < serverHistory.length; i++) {
            const item = serverHistory[i];
            
            if (item.type === 'function_call') {
              const callId = (item as any).callId;
              const reasoning = reasoningBeforeCall.get(callId);
              if (reasoning && !insertedReasonings.has(reasoning)) {
                mergedHistory.push(reasoning);
                insertedReasonings.add(reasoning);
              }
              mergedHistory.push(item);
            } else if (item.type === 'message' && item.role === 'user') {
              mergedHistory.push(item);
            } else if (item.type === 'message' && item.role === 'assistant') {
              if (lastReasoning && !insertedReasonings.has(lastReasoning)) {
                mergedHistory.push(lastReasoning);
                insertedReasonings.add(lastReasoning);
              }
              mergedHistory.push(item);
            } else {
              mergedHistory.push(item);
            }
          }
          
          // 如果 firstReasoning 还没插入
          if (firstReasoning && !insertedReasonings.has(firstReasoning)) {
            let insertIdx = -1;
            for (let i = 0; i < mergedHistory.length; i++) {
              const histItem = mergedHistory[i];
              if (histItem.type === 'message' && (histItem as any).role === 'user') {
                insertIdx = i + 1;
                break;
              }
            }
            if (insertIdx > -1) {
              mergedHistory.splice(insertIdx, 0, firstReasoning);
              insertedReasonings.add(firstReasoning);
            }
          }
          
          // 确保当前轮次的 reasoning 已添加
          if (interruptCurrentReasoning) {
            const hasCurrentReasoning = mergedHistory.some(
              h => (h as any).type === 'reasoning_item' && (h as any).content === interruptCurrentReasoning
            );
            if (!hasCurrentReasoning) {
              mergedHistory.push({
                type: 'reasoning_item',
                content: interruptCurrentReasoning,
                id: `reasoning-interrupt-${Date.now()}`,
              } as unknown as AgentInputItem);
            }
          }
          
          return mergedHistory;
        });
        
        setApprovals(event.data.approvals);
        setIsStreaming(false);
        setStreamingText('');
        setStreamingReasoning('');
        currentReasoningRef.current = '';
        break;

      case 'done':
        // 完成 - 保留所有历史 reasoning，按正确位置插入
        const doneCurrentReasoning = currentReasoningRef.current;
        
        setHistory(prev => {
          const serverHistory = [...event.data.history];
          const mergedHistory: AgentInputItem[] = [];
          
          // 从 prev 中构建 reasoning 位置映射
          // Map: function_call 的 callId -> 在它之前的 reasoning_item
          const reasoningBeforeCall = new Map<string, AgentInputItem>();
          // 第一个 reasoning（在任何 function_call 之前，user message 之后）
          let firstReasoning: AgentInputItem | null = null;
          let foundFirstCall = false;
          // 最后一个 reasoning（在所有 function_call 之后）
          let lastReasoning: AgentInputItem | null = null;
          let lastReasoningIdx = -1;
          
          // 遍历 prev，记录每个 reasoning 的位置
          for (let i = 0; i < prev.length; i++) {
            const item = prev[i];
            if ((item as any).type === 'reasoning_item') {
              // 查找这个 reasoning 之后的第一个 function_call
              let foundCall = false;
              for (let j = i + 1; j < prev.length; j++) {
                if (prev[j].type === 'function_call') {
                  const callId = (prev[j] as any).callId;
                  reasoningBeforeCall.set(callId, item);
                  foundCall = true;
                  foundFirstCall = true;
                  break;
                }
                if ((prev[j] as any).type === 'reasoning_item') {
                  break; // 遇到下一个 reasoning，停止
                }
              }
              if (!foundCall) {
                // 这个 reasoning 后面没有 function_call
                if (!foundFirstCall) {
                  firstReasoning = item;
                } else {
                  lastReasoning = item;
                  lastReasoningIdx = i;
                }
              }
            }
          }
          
          // 记录已插入的 reasoning，避免重复
          const insertedReasonings = new Set<AgentInputItem>();
          
          for (let i = 0; i < serverHistory.length; i++) {
            const item = serverHistory[i];
            
            if (item.type === 'function_call') {
              // 在 function_call 之前插入对应的 reasoning
              const callId = (item as any).callId;
              const reasoning = reasoningBeforeCall.get(callId);
              if (reasoning && !insertedReasonings.has(reasoning)) {
                mergedHistory.push(reasoning);
                insertedReasonings.add(reasoning);
              }
              mergedHistory.push(item);
            } else if (item.type === 'message' && item.role === 'user') {
              mergedHistory.push(item);
              // 在 user message 之后，如果有 firstReasoning 且还没插入
              // 需要判断这是否是当前轮次的 user message
            } else if (item.type === 'message' && item.role === 'assistant') {
              // 在 assistant message 之前，插入最后的 reasoning
              if (lastReasoning && !insertedReasonings.has(lastReasoning)) {
                mergedHistory.push(lastReasoning);
                insertedReasonings.add(lastReasoning);
              } else if (doneCurrentReasoning && !insertedReasonings.has(doneCurrentReasoning as any)) {
                // 如果还有未保存的当前 reasoning
                const hasThisReasoning = mergedHistory.some(
                  h => (h as any).type === 'reasoning_item' && (h as any).content === doneCurrentReasoning
                );
                if (!hasThisReasoning) {
                  mergedHistory.push({
                    type: 'reasoning_item',
                    content: doneCurrentReasoning,
                    id: `reasoning-${Date.now()}`,
                  } as unknown as AgentInputItem);
                }
              }
              
              mergedHistory.push(item);
            } else {
              // 其他类型（如 function_call_result）
              mergedHistory.push(item);
            }
          }
          
          // 如果 firstReasoning 还没插入（没有任何 function_call 的情况）
          if (firstReasoning && !insertedReasonings.has(firstReasoning)) {
            // 找到第一个 user message 之后的位置插入
            let insertIdx = -1;
            for (let i = 0; i < mergedHistory.length; i++) {
              const histItem = mergedHistory[i];
              if (histItem.type === 'message' && (histItem as any).role === 'user') {
                insertIdx = i + 1;
                break;
              }
            }
            if (insertIdx > -1) {
              mergedHistory.splice(insertIdx, 0, firstReasoning);
              insertedReasonings.add(firstReasoning);
            }
          }
          
          return mergedHistory;
        });
        
        setApprovals([]);
        setIsStreaming(false);
        setStreamingText('');
        setStreamingReasoning('');
        currentReasoningRef.current = '';
        break;

      case 'error':
        console.error('Stream error:', event.data.error);
        setIsStreaming(false);
        setStreamingText('');
        setStreamingReasoning('');
        break;
    }
  }, []);

  async function makeStreamingRequest({
    message,
    decisions,
  }: {
    message?: string;
    decisions?: Map<string, 'approved' | 'rejected'>;
  }) {
    // 过滤掉 reasoning_item，因为后端不支持这个类型
    // reasoning_item 只在前端用于显示，不应发送到后端
    const messages = history.filter(item => (item as any).type !== 'reasoning_item');

    if (message) {
      messages.push({ type: 'message', role: 'user', content: message });
      // 保留 reasoning_item 用于显示，但添加新的用户消息
      setHistory([...history, { type: 'message', role: 'user', content: message } as AgentInputItem]);
    }

    setIsStreaming(true);
    setStreamingText('');
    setStreamingReasoning('');
    currentReasoningRef.current = '';
    reasoningSavedRef.current = false;
    pendingToolCalls.current.clear();

    try {
      const response = await fetch('/api/basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          conversationId,
          decisions: Object.fromEntries(decisions ?? []),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 事件
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6);
          } else if (line === '' && eventType && eventData) {
            // 完整事件
            try {
              const data = JSON.parse(eventData);
              processStreamEvent({ type: eventType, data } as StreamEvent);
            } catch (e) {
              console.error('Failed to parse event data:', e);
            }
            eventType = '';
            eventData = '';
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      setStreamingText('');
    }
  }

  const handleSend = async (message: string) => {
    setStreamingReasoning('');
    await makeStreamingRequest({ message });
  };

  async function handleDone(decisions: Map<string, 'approved' | 'rejected'>) {
    await makeStreamingRequest({ decisions });
  }

  // 构建显示用的历史（包含流式文本）
  const displayHistory = [...history];
  if (isStreaming && streamingText) {
    // 如果正在流式输出且有文本，添加临时消息
    displayHistory.push({
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: streamingText }],
      status: 'in_progress',
    } as unknown as AgentInputItem);
  } else if (isStreaming && !streamingText && pendingToolCalls.current.size === 0) {
    // 正在等待但还没有内容（可能正在思考）
    displayHistory.push({
      type: 'message',
      role: 'assistant',
      content: [],
      status: 'in_progress',
    } as unknown as AgentInputItem);
  }

  return (
    <>
      <App
        history={displayHistory}
        onSend={handleSend}
        isStreaming={isStreaming}
        currentReasoning={streamingReasoning}
      />
      <Approvals approvals={approvals} onDone={handleDone} />
    </>
  );
}

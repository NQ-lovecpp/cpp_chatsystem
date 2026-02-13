'use client';

import type { AgentInputItem } from '@openai/agents';
import { TextMessage } from './messages/TextMessage';
import { ThinkingBlock, ThinkingBlockItem, ToolCallItem } from './messages/ThinkingBlock';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export type HistoryProps = {
  history: AgentInputItem[];
  isLoading?: boolean;
  currentReasoning?: string;
};

export type ProcessedMessageItem = {
  type: 'message';
  role: 'user' | 'assistant';
  content: string;
  id: string;
  status?: 'in_progress' | 'completed';
  reasoning?: string;
};

type ProcessedToolCallItem = {
  type: 'function_call';
  name: string;
  arguments: string;
  id: string;
  callId: string;
  output?: string;
  status: 'completed' | 'in_progress';
};

type ProcessedReasoningItemType = {
  type: 'reasoning_item';
  content: string;
  id: string;
};

type ProcessedItem = ProcessedMessageItem | ProcessedToolCallItem | ProcessedReasoningItemType;

// Group items for display: user message -> thinking block -> assistant response
type DisplayGroup = {
  userMessage?: ProcessedMessageItem;
  thinkingItems: ThinkingBlockItem[];
  assistantMessage?: ProcessedMessageItem;
  isStreaming: boolean;
};

function processItems(items: AgentInputItem[]): ProcessedItem[] {
  const processedItems: ProcessedItem[] = [];

  for (const item of items) {
    // 处理独立的 reasoning_item
    if ((item as any).type === 'reasoning_item') {
      processedItems.push({
        type: 'reasoning_item',
        content: (item as any).content,
        id: (item as any).id ?? `reasoning-${processedItems.length}`,
      });
      continue;
    }

    if (item.type === 'function_call') {
      // 确保 id 和 callId 都有有效值
      const callId = item.callId ?? `call-${processedItems.length}-${Date.now()}`;
      processedItems.push({
        type: 'function_call',
        name: item.name,
        arguments: item.arguments,
        id: item.id || callId,
        callId: callId,
        status: 'in_progress',
      });
    }

    if (item.type === 'function_call_result') {
      const index = processedItems.findIndex(
        (i) => i.type === 'function_call' && item.callId === i.callId,
      );

      if (index !== -1 && processedItems[index].type === 'function_call') {
        const outputValue = item.output;

        let extractedOutput = '';
        if (typeof outputValue === 'string') {
          extractedOutput = outputValue;
        } else if (Array.isArray(outputValue)) {
          extractedOutput = outputValue
            .map((content: any) => {
              if (typeof content === 'string') return content;
              if (content?.type === 'text') return content.text;
              if (content?.type === 'image') return content.data ?? '[image]';
              if (content?.text) return content.text;
              return JSON.stringify(content);
            })
            .join('\n');
        } else if (outputValue && typeof outputValue === 'object') {
          if ('type' in outputValue && outputValue.type === 'text' && 'text' in outputValue) {
            extractedOutput = (outputValue as { type: 'text'; text: string }).text;
          } else if ('type' in outputValue && outputValue.type === 'image') {
            extractedOutput = (outputValue as { type: 'image'; data?: string }).data ?? '[image]';
          } else if ('text' in outputValue) {
            extractedOutput = (outputValue as { text: string }).text;
          } else {
            extractedOutput = JSON.stringify(outputValue);
          }
        }

        (processedItems[index] as ProcessedToolCallItem).output = extractedOutput;
        (processedItems[index] as ProcessedToolCallItem).status = 'completed';
      }
    }

    if (item.type === 'message') {
      processedItems.push({
        type: 'message',
        role: item.role === 'system' ? 'assistant' : item.role,
        content:
          typeof item.content === 'string'
            ? item.content
            : item.content
              .map((content) => {
                if (
                  content.type === 'input_text' ||
                  content.type === 'output_text'
                ) {
                  return content.text;
                }
                if (content.type === 'audio') {
                  return content.transcript ?? '';
                }
                if (content.type === 'refusal') {
                  return content.refusal;
                }
                return '';
              })
              .join('\n') || '',
        id: item.id ?? '',
        status: (item as any).status,
        reasoning: (item as any).reasoning,
      });
    }
  }

  return processedItems;
}

function groupItemsForDisplay(items: ProcessedItem[], currentReasoning?: string): DisplayGroup[] {
  const groups: DisplayGroup[] = [];
  let currentGroup: DisplayGroup | null = null;

  for (const item of items) {
    if (item.type === 'message' && item.role === 'user') {
      // Start a new group with user message
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        userMessage: item,
        thinkingItems: [],
        isStreaming: false,
      };
    } else if (item.type === 'reasoning_item') {
      // Add reasoning to current group (in order)
      if (!currentGroup) {
        currentGroup = { thinkingItems: [], isStreaming: false };
      }
      // 确保 id 唯一
      const reasoningId = item.id || `reasoning-${currentGroup.thinkingItems.length}-${Date.now()}`;
      currentGroup.thinkingItems.push({
        type: 'reasoning',
        content: item.content,
        id: reasoningId,
      });
    } else if (item.type === 'function_call') {
      // Add tool call to current group
      if (!currentGroup) {
        currentGroup = { thinkingItems: [], isStreaming: false };
      }
      // 确保有有效的 id
      const toolId = item.id || item.callId || `tool-${currentGroup.thinkingItems.length}-${Date.now()}`;
      currentGroup.thinkingItems.push({
        type: 'tool_call',
        name: item.name,
        arguments: item.arguments,
        id: toolId,
        callId: item.callId || toolId,
        output: item.output,
        status: item.status,
      } as ToolCallItem);
    } else if (item.type === 'message' && item.role === 'assistant') {
      // Set assistant message for current group
      if (!currentGroup) {
        currentGroup = { thinkingItems: [], isStreaming: false };
      }
      
      // Add reasoning from message to thinking items if present
      // 这是最后的 reasoning（在所有 tool calls 之后），应该添加到末尾
      if (item.reasoning) {
        // 检查是否已经有相同内容的 reasoning（避免重复）
        const existingReasoningContent = currentGroup.thinkingItems
          .filter(i => i.type === 'reasoning')
          .map(i => i.content)
          .join('\n');
        
        // 生成唯一 id
        const msgId = item.id || `msg-${groups.length}`;
        
        // 如果没有 reasoning，或者 final reasoning 有新内容
        if (!existingReasoningContent) {
          currentGroup.thinkingItems.push({
            type: 'reasoning',
            content: item.reasoning,
            id: `reasoning-msg-${msgId}-${Date.now()}`,
          });
        } else if (!existingReasoningContent.includes(item.reasoning) && !item.reasoning.includes(existingReasoningContent)) {
          // final reasoning 有新内容，添加到末尾
          currentGroup.thinkingItems.push({
            type: 'reasoning',
            content: item.reasoning,
            id: `reasoning-final-${msgId}-${Date.now()}`,
          });
        }
      }
      
      currentGroup.assistantMessage = item;
      currentGroup.isStreaming = item.status === 'in_progress';
      
      // If there's content, push the group
      if (item.content || currentGroup.thinkingItems.length > 0) {
        groups.push(currentGroup);
        currentGroup = null;
      }
    }
  }

  // Handle remaining group
  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

export function History({ history, isLoading = false, currentReasoning = '' }: HistoryProps) {
  const processedItems = useMemo(() => processItems(history), [history]);
  const displayGroups = useMemo(
    () => groupItemsForDisplay(processedItems, currentReasoning),
    [processedItems, currentReasoning]
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 检查是否在底部
  const checkIfAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const threshold = 100; // 100px 容差
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // 滚动事件处理
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfAtBottom();
      setIsAtBottom(atBottom);
      // 只有在生成时且不在底部时显示按钮
      setShowScrollButton(!atBottom && isLoading);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom, isLoading]);

  // 当 isLoading 状态变化时更新按钮显示
  useEffect(() => {
    if (!isLoading) {
      setShowScrollButton(false);
    } else if (!isAtBottom) {
      setShowScrollButton(true);
    }
  }, [isLoading, isAtBottom]);

  // Auto-scroll to bottom - 只有在用户已经在底部时才自动滚动
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayGroups, isLoading, currentReasoning, isAtBottom]);

  // 手动滚动到底部
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setShowScrollButton(false);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overscroll-contain scrollbar-thin relative"
    >
      <div className="p-4 space-y-2 min-h-full" id="chatHistory">
        {displayGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            {/* User message */}
            {group.userMessage && (
              <TextMessage
                text={group.userMessage.content}
                isUser={true}
              />
            )}

            {/* Thinking block (reasoning + tool calls) */}
            {(group.thinkingItems.length > 0 || (group.isStreaming && currentReasoning)) && (
              <ThinkingBlock
                items={group.thinkingItems}
                isStreaming={group.isStreaming}
                currentReasoning={group.isStreaming ? currentReasoning : ''}
              />
            )}

            {/* Assistant message */}
            {group.assistantMessage && group.assistantMessage.content && (
              <TextMessage
                text={group.assistantMessage.content}
                isUser={false}
              />
            )}
          </div>
        ))}

        {/* Loading state */}
        {isLoading && displayGroups.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              <span className="text-sm">Starting...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-50 flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 rounded-full shadow-lg hover:bg-zinc-50 transition-all text-sm text-zinc-600"
        >
          <ChevronDown size={16} />
          <span>回到底部</span>
        </button>
      )}
    </div>
  );
}

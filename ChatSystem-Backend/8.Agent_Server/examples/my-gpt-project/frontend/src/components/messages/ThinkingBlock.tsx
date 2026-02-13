'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Terminal,
  Search,
  Globe,
  Code2,
  Wrench,
  ChevronRight,
  CloudSun,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import {
  extractCodeFromArgs,
  extractSearchQuery,
  detectContentType,
} from '@/lib/formatters';

// ==================== Types ====================

export type ThinkingItem = {
  type: 'reasoning';
  content: string;
  id: string;
};

export type ToolCallItem = {
  type: 'tool_call';
  name: string;
  arguments: string;
  id: string;
  callId: string;
  output?: string;
  status: 'completed' | 'in_progress';
};

export type ThinkingBlockItem = ThinkingItem | ToolCallItem;

type ThinkingBlockProps = {
  items: ThinkingBlockItem[];
  isStreaming?: boolean;
  currentReasoning?: string;
};

// 解析后的思维段落
type ReasoningSection = {
  title: string;
  content: string;
  id: string;
};

// ==================== Helper Functions ====================

function getToolIcon(toolName: string) {
  const name = toolName.toLowerCase();
  const iconClass = 'text-zinc-500';
  
  if (name.includes('python') || name.includes('execute')) {
    return <Terminal size={14} className={iconClass} />;
  }
  if (name.includes('search') || name.includes('query')) {
    return <Search size={14} className={iconClass} />;
  }
  if (name.includes('open') || name.includes('browse') || name.includes('web') || name.includes('fetch')) {
    return <Globe size={14} className={iconClass} />;
  }
  if (name.includes('find')) {
    return <FileText size={14} className={iconClass} />;
  }
  if (name.includes('code') || name.includes('script')) {
    return <Code2 size={14} className={iconClass} />;
  }
  if (name.includes('weather')) {
    return <CloudSun size={14} className={iconClass} />;
  }
  return <Wrench size={14} className={iconClass} />;
}

function getToolSummary(toolName: string, args: string): string {
  const name = toolName.toLowerCase();

  if (name.includes('search') || name.includes('query')) {
    const query = extractSearchQuery(args);
    return query ? `Searched "${query}"` : 'Searched';
  }

  if (name.includes('python') || name.includes('execute')) {
    const codeInfo = extractCodeFromArgs(args);
    const lines = codeInfo?.code.split('\n').length || 0;
    return lines > 0 ? `Executed Python (${lines} lines)` : 'Executed Python';
  }

  if (name === 'open') {
    try {
      const parsed = JSON.parse(args);
      if (parsed.id !== undefined) {
        return `Opened link #${parsed.id}`;
      }
    } catch {}
    return 'Opened page';
  }

  if (name === 'find') {
    try {
      const parsed = JSON.parse(args);
      if (parsed.pattern) {
        return `Finding "${parsed.pattern}"`;
      }
    } catch {}
    return 'Finding content';
  }

  return `Called ${toolName}`;
}

// 解析 reasoning 文本，按 **标题** 分段
function parseReasoningSections(text: string, idPrefix: string = ''): ReasoningSection[] {
  if (!text) return [];
  
  const sections: ReasoningSection[] = [];
  // 匹配 **标题** 模式，支持换行或文本开头
  const regex = /\*\*([^*]+)\*\*/g;
  let match;
  let sectionIndex = 0;
  
  // 找出所有标题位置
  const matches: { title: string; start: number; end: number }[] = [];
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      title: match[1].trim(),
      start: match.index,
      end: regex.lastIndex,
    });
  }
  
  // 生成唯一前缀
  const prefix = idPrefix || `s-${text.slice(0, 20).replace(/\W/g, '')}-`;
  
  if (matches.length === 0) {
    // 没有标题，整体作为一个段落
    return [{
      title: 'Thinking',
      content: text.trim(),
      id: `${prefix}section-0`,
    }];
  }
  
  // 根据标题分段
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    
    // 获取当前段落的内容（从标题结束到下一个标题开始或文本结束）
    const contentEnd = next ? next.start : text.length;
    const content = text.slice(current.end, contentEnd).trim();
    
    sections.push({
      title: current.title,
      content: content,
      id: `${prefix}section-${sectionIndex++}`,
    });
  }
  
  return sections;
}

// 渲染 Markdown 文本（简单实现）
function renderMarkdownText(text: string): React.ReactNode {
  if (!text) return null;
  
  // 分割成段落
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, idx) => {
    // 处理行内代码
    const parts = paragraph.split(/(`[^`]+`)/g);
    const rendered = parts.map((part, partIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={partIdx} className="px-1 py-0.5 mx-0.5 rounded bg-zinc-100 text-zinc-700 text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      // 处理加粗
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((boldPart, boldIdx) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          return <strong key={`${partIdx}-${boldIdx}`} className="font-semibold">{boldPart.slice(2, -2)}</strong>;
        }
        return boldPart;
      });
    });
    
    return (
      <p key={idx} className="mb-2 last:mb-0 leading-relaxed">
        {rendered}
      </p>
    );
  });
}

// ==================== Tool Detail Components ====================

function ToolArgumentsDisplay({ args, toolName }: { args: string; toolName: string }) {
  const [copied, setCopied] = useState(false);
  const codeInfo = extractCodeFromArgs(args);
  const searchQuery = extractSearchQuery(args);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(args);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (codeInfo) {
    return (
      <div className="mt-2">
        <CodeBlock code={codeInfo.code} language={codeInfo.language} maxHeight="200px" />
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="mt-2 flex items-center gap-2 py-2 px-3 rounded-md bg-zinc-50 border border-zinc-100">
        <Search size={12} className="text-zinc-400 flex-shrink-0" />
        <span className="text-xs text-zinc-500">Query:</span>
        <span className="text-xs font-medium text-zinc-700 truncate">{searchQuery}</span>
      </div>
    );
  }

  let formattedArgs = args;
  try {
    formattedArgs = JSON.stringify(JSON.parse(args), null, 2);
  } catch {}

  return (
    <div className="mt-2 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Parameters</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
        </button>
      </div>
      <pre className="text-xs text-zinc-600 font-mono bg-zinc-50 rounded-md p-2 whitespace-pre-wrap break-all max-h-[120px] overflow-y-auto">
        {formattedArgs}
      </pre>
    </div>
  );
}

function ToolOutputDisplay({ output, toolName }: { output: string; toolName: string }) {
  const contentType = detectContentType(toolName, output);

  if (contentType === 'python' || contentType === 'javascript') {
    return <CodeBlock code={output} language={contentType} maxHeight="200px" />;
  }

  if (contentType === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(output), null, 2);
      return <CodeBlock code={formatted} language="json" maxHeight="200px" />;
    } catch {}
  }

  return (
    <pre className="text-xs text-zinc-600 whitespace-pre-wrap break-words font-mono bg-zinc-50 rounded-md p-2 max-h-[200px] overflow-y-auto">
      {output}
    </pre>
  );
}

// ==================== Section Components ====================

// 单个思维段落组件
function ReasoningSectionItem({ 
  section, 
  isActive, 
  isLast,
  defaultExpanded = false 
}: { 
  section: ReasoningSection; 
  isActive: boolean;
  isLast: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isActive);

  // 当变为活跃状态时展开
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  // 当不再是最后一个且不活跃时，折叠
  useEffect(() => {
    if (!isActive && !isLast) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, isLast]);

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 py-2 px-3 hover:bg-zinc-50/50 transition-colors text-left"
      >
        <ChevronRight
          size={12}
          className={cn(
            'text-zinc-400 transition-transform flex-shrink-0',
            isExpanded && 'rotate-90'
          )}
        />
        <Lightbulb size={14} className="text-zinc-400 flex-shrink-0" />
        {isActive && !section.content ? (
          <AnimatedShinyText className="text-sm font-medium" shimmerWidth={80}>
            {section.title}
          </AnimatedShinyText>
        ) : (
          <span className="text-sm text-zinc-600 font-medium truncate">{section.title}</span>
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && section.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-9 text-sm text-zinc-600">
              {renderMarkdownText(section.content)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 工具调用组件
function ToolCallItemDisplay({ item }: { item: ToolCallItem }) {
  const [showDetails, setShowDetails] = useState(false);
  const isRunning = item.status === 'in_progress';

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center gap-2 py-2 px-3 hover:bg-zinc-50/50 transition-colors text-left"
      >
        <ChevronRight
          size={12}
          className={cn(
            'text-zinc-400 transition-transform flex-shrink-0',
            showDetails && 'rotate-90'
          )}
        />
        {getToolIcon(item.name)}
        {isRunning ? (
          <AnimatedShinyText className="text-sm" shimmerWidth={80}>
            {getToolSummary(item.name, item.arguments)}
          </AnimatedShinyText>
        ) : (
          <span className="text-sm text-zinc-600 truncate">
            {getToolSummary(item.name, item.arguments)}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-9 space-y-2">
              <ToolArgumentsDisplay args={item.arguments} toolName={item.name} />
              
              {item.status === 'completed' && item.output && (
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1 block">
                    Output
                  </span>
                  <ToolOutputDisplay output={item.output} toolName={item.name} />
                </div>
              )}
              
              {item.status === 'in_progress' && (
                <div className="flex items-center gap-2 py-2 text-xs text-zinc-400">
                  <motion.div
                    className="w-1 h-1 rounded-full bg-zinc-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span>Running...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Unified Display Item ====================

type DisplayItem = 
  | { type: 'reasoning_section'; section: ReasoningSection; isLast: boolean }
  | { type: 'tool_call'; item: ToolCallItem };

// ==================== Main Component ====================

export function ThinkingBlock({ items, isStreaming = false, currentReasoning = '' }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 解析当前流式 reasoning 为段落
  const currentSections = useMemo(() => {
    return parseReasoningSections(currentReasoning, 'streaming-');
  }, [currentReasoning]);
  
  // 按原始顺序构建显示项列表
  const allDisplayItems = useMemo(() => {
    const result: DisplayItem[] = [];
    
    // 处理历史 items，保持原始顺序
    for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
      const item = items[itemIdx];
      if (item.type === 'reasoning') {
        // 为每个 reasoning item 生成唯一前缀
        const idPrefix = `r${itemIdx}-${item.id || ''}-`;
        const sections = parseReasoningSections(item.content, idPrefix);
        sections.forEach((section, idx) => {
          result.push({
            type: 'reasoning_section',
            section,
            isLast: idx === sections.length - 1,
          });
        });
      } else if (item.type === 'tool_call') {
        result.push({
          type: 'tool_call',
          item,
        });
      }
    }
    
    // 如果正在流式传输且有当前 reasoning，添加到末尾
    if (isStreaming && currentSections.length > 0) {
      currentSections.forEach((section, idx) => {
        result.push({
          type: 'reasoning_section',
          section,
          isLast: idx === currentSections.length - 1,
        });
      });
    }
    
    return result;
  }, [items, isStreaming, currentSections]);
  
  // 统计数据
  const sectionCount = allDisplayItems.filter(d => d.type === 'reasoning_section').length;
  const toolCallCount = allDisplayItems.filter(d => d.type === 'tool_call').length;
  
  // 检查是否有工具正在执行
  const hasRunningTools = allDisplayItems.some(
    d => d.type === 'tool_call' && d.item.status === 'in_progress'
  );
  
  // 是否正在活跃（流式传输或有工具正在执行）
  const isActive = isStreaming || hasRunningTools;
  
  const hasContent = allDisplayItems.length > 0 || (isStreaming && currentReasoning);
  
  // Auto-collapse when all activity ends
  useEffect(() => {
    if (!isActive && hasContent) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, hasContent]);

  // Auto-expand when activity starts
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  if (!hasContent) return null;

  // 计算摘要文本
  const getSummaryText = () => {
    const parts: string[] = [];
    if (sectionCount > 0) {
      parts.push(`Thought for ${sectionCount} step${sectionCount > 1 ? 's' : ''}`);
    }
    if (toolCallCount > 0) {
      parts.push(`${toolCallCount} tool${toolCallCount > 1 ? 's' : ''} used`);
    }
    return parts.join(' · ') || 'Thinking';
  };

  const isThinking = isActive;

  return (
    <div className="mb-3">
      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 py-2 px-3 hover:bg-zinc-50/50 transition-colors"
        >
          <ChevronRight
            size={14}
            className={cn(
              'text-zinc-400 transition-transform flex-shrink-0',
              isExpanded && 'rotate-90'
            )}
          />
          <Lightbulb size={14} className="text-zinc-400 flex-shrink-0" />
          
          {isThinking ? (
            <AnimatedShinyText className="text-sm font-medium" shimmerWidth={80}>
              Thinking
            </AnimatedShinyText>
          ) : (
            <span className="text-sm text-zinc-500">{getSummaryText()}</span>
          )}
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-zinc-100">
                {/* 按顺序渲染所有项 */}
                {allDisplayItems.map((displayItem, idx) => {
                  if (displayItem.type === 'reasoning_section') {
                    const isLastSection = idx === allDisplayItems.length - 1 || 
                      allDisplayItems.slice(idx + 1).every(d => d.type === 'tool_call');
                    return (
                      <ReasoningSectionItem
                        key={displayItem.section.id}
                        section={displayItem.section}
                        isActive={isStreaming && isLastSection && displayItem.isLast}
                        isLast={isLastSection}
                        defaultExpanded={isActive || sectionCount === 1}
                      />
                    );
                  } else {
                    // 使用 callId 或 id 或 idx 作为 key，确保唯一性
                    const toolKey = displayItem.item.callId || displayItem.item.id || `tool-${idx}`;
                    return (
                      <ToolCallItemDisplay key={toolKey} item={displayItem.item} />
                    );
                  }
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

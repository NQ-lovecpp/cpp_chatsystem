'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Search,
  Globe,
  Code2,
  Wrench,
  ChevronDown,
  Copy,
  Check,
  CloudSun,
  ExternalLink,
  FileText,
  Link2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { ThinkingDots, FadeIn } from '@/components/ui/LoadingEffects';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  extractCodeFromArgs,
  extractSearchQuery,
  detectContentType,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';

export type ProcessedFunctionCallItem = {
  type: 'function_call';
  name: string;
  arguments: string;
  id: string;
  callId: string;
  output?: string;
  status: 'completed' | 'in_progress';
};

type FunctionCallMessageProps = {
  message: ProcessedFunctionCallItem;
};

/**
 * 获取工具对应的图标
 */
function getToolIcon(toolName: string) {
  const name = toolName.toLowerCase();

  if (name.includes('python') || name.includes('execute')) {
    return <Terminal size={16} className="text-emerald-500" />;
  }
  if (name.includes('search') || name.includes('query')) {
    return <Search size={16} className="text-blue-500" />;
  }
  if (name.includes('open') || name.includes('browse') || name.includes('web') || name.includes('fetch')) {
    return <Globe size={16} className="text-purple-500" />;
  }
  if (name.includes('find')) {
    return <FileText size={16} className="text-orange-500" />;
  }
  if (name.includes('code') || name.includes('script')) {
    return <Code2 size={16} className="text-orange-500" />;
  }
  if (name.includes('weather')) {
    return <CloudSun size={16} className="text-amber-500" />;
  }
  return <Wrench size={16} className="text-zinc-500" />;
}

/**
 * 获取工具调用的简短描述
 */
function getToolSummary(
  toolName: string,
  args: string
): { summary: string; detail?: string } {
  const name = toolName.toLowerCase();

  // 搜索工具
  if (name.includes('search') || name.includes('query')) {
    const query = extractSearchQuery(args);
    return {
      summary: 'Searched',
      detail: query ? `"${query}"` : undefined,
    };
  }

  // Python 执行
  if (name.includes('python') || name.includes('execute')) {
    const codeInfo = extractCodeFromArgs(args);
    const lines = codeInfo?.code.split('\n').length || 0;
    return {
      summary: 'Executed Python',
      detail: lines > 0 ? `${lines} lines` : undefined,
    };
  }

  // 打开网页
  if (name === 'open') {
    try {
      const parsed = JSON.parse(args);
      if (parsed.id !== undefined) {
        return {
          summary: 'Opened link',
          detail: `#${parsed.id}`,
        };
      }
    } catch {
      // ignore
    }
    return { summary: 'Opened page' };
  }

  // 查找
  if (name === 'find') {
    try {
      const parsed = JSON.parse(args);
      if (parsed.pattern) {
        return {
          summary: 'Finding',
          detail: `"${parsed.pattern}"`,
        };
      }
    } catch {
      // ignore
    }
    return { summary: 'Finding content' };
  }

  // 网页浏览
  if (name.includes('browse') || name.includes('web') || name.includes('fetch')) {
    try {
      const parsed = JSON.parse(args);
      const url = parsed.url || parsed.link;
      if (url) {
        const hostname = new URL(url).hostname;
        return {
          summary: 'Visited',
          detail: hostname,
        };
      }
    } catch {
      // ignore
    }
    return { summary: 'Browsed web' };
  }

  // 默认
  return { summary: `Called ${toolName}` };
}

/**
 * 参数展示组件
 */
function ArgumentsDisplay({ args, toolName }: { args: string; toolName: string }) {
  const [copied, setCopied] = useState(false);

  const codeInfo = extractCodeFromArgs(args);
  const searchQuery = extractSearchQuery(args);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(args);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 如果是代码执行，展示代码块
  if (codeInfo) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-medium">Code</span>
        </div>
        <CodeBlock
          code={codeInfo.code}
          language={codeInfo.language}
          maxHeight="250px"
        />
      </div>
    );
  }

  // 如果是搜索，展示搜索卡片
  if (searchQuery) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-blue-50 border border-blue-100">
        <Search size={14} className="text-blue-500 flex-shrink-0" />
        <span className="text-sm text-zinc-500">Query:</span>
        <span className="text-sm font-medium text-zinc-800 truncate">{searchQuery}</span>
      </div>
    );
  }

  // 默认展示格式化的 JSON（简洁版）
  let formattedArgs = args;
  try {
    formattedArgs = JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    // 保持原样
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 font-medium">Parameters</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {copied ? (
            <Check size={12} className="text-green-500" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>
      <div className="max-h-[150px] overflow-y-auto rounded-lg">
        <pre className="text-xs text-zinc-600 font-mono bg-zinc-50 rounded-lg p-3 whitespace-pre-wrap break-all">
          {formattedArgs}
        </pre>
      </div>
    </div>
  );
}

/**
 * 解析带行号的搜索输出内容
 */
function parseSearchOutput(output: string): { 
  title?: string; 
  url?: string; 
  viewingInfo?: string;
  lines: { num: string; content: string }[] 
} {
  const lines = output.split('\n');
  let title: string | undefined;
  let url: string | undefined;
  let viewingInfo: string | undefined;
  const parsedLines: { num: string; content: string }[] = [];

  for (const line of lines) {
    // 解析标题行 [n] Title (url)
    const titleMatch = line.match(/^\[(\d+)\]\s+(.+?)\s+\(https?:\/\//);
    if (titleMatch) {
      title = titleMatch[2];
      const urlMatch = line.match(/\((https?:\/\/[^)]+)\)/);
      if (urlMatch) url = urlMatch[1];
      continue;
    }

    // 解析 viewing lines 信息
    const viewingMatch = line.match(/\*\*viewing lines \[(\d+)\s*-\s*(\d+)\] of (\d+)\*\*/i);
    if (viewingMatch) {
      viewingInfo = `Lines ${viewingMatch[1]}-${viewingMatch[2]} of ${viewingMatch[3]}`;
      continue;
    }

    // 解析带行号的内容 L0:, L1:, etc.
    const lineMatch = line.match(/^(L\d+):\s*(.*)$/);
    if (lineMatch) {
      parsedLines.push({ num: lineMatch[1], content: lineMatch[2] });
    }
  }

  return { title, url, viewingInfo, lines: parsedLines };
}

/**
 * 搜索结果输出组件
 */
function SearchOutputDisplay({ output, toolName }: { output: string; toolName: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsed = parseSearchOutput(output);
  
  // 提取所有 URL
  const urlMatches = output.match(/https?:\/\/[^\s\)]+/g) || [];
  const uniqueUrls = [...new Set(urlMatches)].slice(0, 5);

  return (
    <div className="space-y-3">
      {/* 标题和 URL */}
      {parsed.title && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
          <Globe size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-zinc-800 line-clamp-2">{parsed.title}</h4>
            {parsed.url && (
              <a 
                href={parsed.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 truncate"
              >
                <ExternalLink size={10} />
                <span className="truncate">{parsed.url}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Viewing Info */}
      {parsed.viewingInfo && (
        <div className="text-xs text-zinc-500 px-1">{parsed.viewingInfo}</div>
      )}

      {/* 相关链接 */}
      {uniqueUrls.length > 0 && !parsed.title && (
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Sources:</span>
          <div className="flex flex-wrap gap-2">
            {uniqueUrls.map((url, idx) => {
              let hostname = url;
              try {
                hostname = new URL(url).hostname.replace('www.', '');
              } catch {}
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                >
                  <Link2 size={10} />
                  <span className="truncate max-w-[120px]">{hostname}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 内容预览/折叠 */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-full">
          <FileText size={14} />
          <span>{isExpanded ? 'Hide raw content' : 'View raw content'}</span>
          <ChevronDown
            size={14}
            className={cn(
              'transition-transform duration-200 ml-auto',
              isExpanded && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 max-h-[300px] overflow-y-auto rounded-lg border bg-zinc-50">
            <pre className="text-xs text-zinc-600 font-mono p-3 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * 输出展示组件
 */
function OutputDisplay({ output, toolName }: { output: string; toolName: string }) {
  const contentType = detectContentType(toolName, output);
  const name = toolName.toLowerCase();

  // 搜索/浏览相关的工具特殊处理
  if (name === 'search' || name === 'open' || name === 'find' || 
      name.includes('browse') || name.includes('web')) {
    return <SearchOutputDisplay output={output} toolName={toolName} />;
  }

  // 代码输出
  if (contentType === 'python' || contentType === 'javascript') {
    return <CodeBlock code={output} language={contentType} maxHeight="250px" />;
  }

  // JSON 输出
  if (contentType === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(output), null, 2);
      return <CodeBlock code={formatted} language="json" maxHeight="250px" />;
    } catch {
      // 继续用文本展示
    }
  }

  // 默认文本展示
  return (
    <div className="max-h-[250px] overflow-y-auto rounded-lg">
      <pre className="text-sm text-zinc-700 whitespace-pre-wrap break-words font-mono bg-zinc-50 rounded-lg p-3">
        {output}
      </pre>
    </div>
  );
}

/**
 * 主函数调用消息组件
 */
export function FunctionCallMessage({ message }: FunctionCallMessageProps) {
  const icon = getToolIcon(message.name);
  const { summary, detail } = getToolSummary(message.name, message.arguments);
  const isCompleted = message.status === 'completed';

  return (
    <FadeIn>
      <div className="w-full max-w-full mb-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border rounded-xl bg-white shadow-sm overflow-hidden">
            {/* 头部 - 工具调用摘要 */}
            <AccordionTrigger className="hover:no-underline py-3 px-4 hover:bg-zinc-50/50">
              <div className="flex items-center gap-3 w-full min-w-0">
                {/* 图标 */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
                    isCompleted ? 'bg-zinc-100' : 'bg-blue-50'
                  )}
                >
                  {isCompleted ? (
                    icon
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {icon}
                    </motion.div>
                  )}
                </div>

                {/* 摘要文字 */}
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <span className="text-sm font-medium text-zinc-700 flex-shrink-0">
                    {summary}
                  </span>
                  {detail && (
                    <span className="text-sm text-zinc-500 truncate">
                      {detail}
                    </span>
                  )}
                </div>

                {/* 状态标签 */}
                <Badge
                  variant={isCompleted ? 'secondary' : 'default'}
                  className={cn(
                    'text-xs flex-shrink-0',
                    isCompleted
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  )}
                >
                  {isCompleted ? 'Done' : 'Running...'}
                </Badge>
              </div>
            </AccordionTrigger>

            {/* 展开内容 */}
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                {/* 参数区域 */}
                <ArgumentsDisplay
                  args={message.arguments}
                  toolName={message.name}
                />

                {/* 分割线 */}
                <div className="border-t border-zinc-100" />

                {/* 输出区域 */}
                <div>
                  <span className="text-xs text-zinc-500 font-medium mb-2 block">
                    Output
                  </span>
                  {isCompleted && message.output ? (
                    <OutputDisplay
                      output={message.output}
                      toolName={message.name}
                    />
                  ) : isCompleted && !message.output ? (
                    <div className="text-sm text-zinc-400 py-2">
                      (No output)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-500 py-2">
                      <ThinkingDots />
                      <span className="text-sm">Executing...</span>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </FadeIn>
  );
}

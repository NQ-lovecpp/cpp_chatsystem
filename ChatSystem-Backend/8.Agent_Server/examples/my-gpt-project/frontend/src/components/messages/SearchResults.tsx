'use client';

import React, { useState } from 'react';
import { ExternalLink, ChevronDown, Globe, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SearchSource } from '@/lib/formatters';

type SourceCardProps = {
  source: SearchSource;
  index: number;
};

/**
 * 单个来源卡片
 */
export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer min-w-[140px] max-w-[200px]"
        >
          {source.favicon ? (
            <img
              src={source.favicon}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe size={14} className="text-zinc-400" />
          )}
          <span className="text-xs text-zinc-600 truncate flex-1">
            {source.hostname || source.title}
          </span>
          <span className="text-[10px] text-zinc-400 bg-zinc-200 rounded-full px-1.5">
            {index + 1}
          </span>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="bottom" align="start">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            {source.favicon && (
              <img
                src={source.favicon}
                alt=""
                className="w-5 h-5 rounded-sm mt-0.5"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-900 line-clamp-2">
                {source.title}
              </h4>
              <p className="text-xs text-zinc-500 truncate">{source.hostname}</p>
            </div>
          </div>
          {source.content && (
            <p className="text-xs text-zinc-600 line-clamp-3">{source.content}</p>
          )}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={12} />
            <span>Open link</span>
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

type SourcesBarProps = {
  sources: SearchSource[];
  maxVisible?: number;
};

/**
 * 来源栏 - 横向排列的来源卡片
 */
export function SourcesBar({ sources, maxVisible = 4 }: SourcesBarProps) {
  const visibleSources = sources.slice(0, maxVisible);
  const hiddenCount = sources.length - maxVisible;

  if (sources.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-xs text-zinc-500 font-medium shrink-0">Sources:</span>
      {visibleSources.map((source, index) => (
        <SourceCard key={source.url || index} source={source} index={index} />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-zinc-400 shrink-0">+{hiddenCount} more</span>
      )}
    </div>
  );
}

/**
 * 引用角标组件
 */
export function CitationBadge({
  index,
  source,
}: {
  index: number;
  source: SearchSource;
}) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors cursor-pointer align-super ml-0.5">
          {index}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" side="top">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            {source.favicon && (
              <img src={source.favicon} alt="" className="w-4 h-4 rounded-sm" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-900 line-clamp-1">
                {source.title}
              </h4>
              <p className="text-xs text-zinc-500">{source.hostname}</p>
            </div>
          </div>
          {source.content && (
            <p className="text-xs text-zinc-600 line-clamp-2">{source.content}</p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

type RawContentViewerProps = {
  content: string;
  title?: string;
};

/**
 * 原始内容查看器 - 可折叠的原始数据展示
 */
export function RawContentViewer({
  content,
  title = 'View Raw Search Content',
}: RawContentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 transition-colors py-2">
        <FileText size={14} />
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={cn(
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="h-[200px] rounded-md border bg-zinc-50 p-3 mt-2">
          <pre className="text-xs text-zinc-600 whitespace-pre-wrap font-mono">
            {content}
          </pre>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

type SearchResultsCardProps = {
  sources: SearchSource[];
  rawContent?: string;
  query?: string;
};

/**
 * 搜索结果卡片 - 完整的搜索结果展示组件
 */
export function SearchResultsCard({
  sources,
  rawContent,
  query,
}: SearchResultsCardProps) {
  return (
    <Card className="py-3 shadow-sm">
      <CardContent className="space-y-3 px-4">
        {/* 搜索查询 */}
        {query && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Searched for:</span>
            <span className="font-medium text-zinc-900">"{query}"</span>
          </div>
        )}

        {/* 来源卡片 */}
        {sources.length > 0 && <SourcesBar sources={sources} />}

        {/* 原始内容（可折叠） */}
        {rawContent && <RawContentViewer content={rawContent} />}
      </CardContent>
    </Card>
  );
}

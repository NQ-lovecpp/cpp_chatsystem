/**
 * Markdown 渲染组件
 * 简单实现，支持代码块、标题、列表、链接等基础语法
 */

import { useMemo } from 'react';

// 代码高亮的简单实现（可以后续替换为 highlight.js 等库）
function CodeBlock({ language, code }) {
    return (
        <div className="relative group my-3">
            {language && (
                <div className="absolute top-0 right-0 px-2 py-1 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-bl">
                    {language}
                </div>
            )}
            <pre className="bg-[var(--color-surface)] rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-[var(--color-text)]">{code}</code>
            </pre>
            <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-surface-elevated)] rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)]"
                title="复制代码"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>
        </div>
    );
}

// 内联代码
function InlineCode({ children }) {
    return (
        <code className="px-1.5 py-0.5 bg-[var(--color-surface)] rounded text-sm text-[var(--color-primary)]">
            {children}
        </code>
    );
}

export default function MarkdownRenderer({ content }) {
    const rendered = useMemo(() => {
        if (!content) return null;
        
        const elements = [];
        let key = 0;
        
        // 分割代码块
        const parts = content.split(/(```[\s\S]*?```)/g);
        
        for (const part of parts) {
            if (part.startsWith('```')) {
                // 代码块
                const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
                if (match) {
                    const [, language, code] = match;
                    elements.push(
                        <CodeBlock key={key++} language={language} code={code.trim()} />
                    );
                }
            } else {
                // 普通文本，处理其他 Markdown 语法
                const lines = part.split('\n');
                let inList = false;
                let listItems = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // 空行
                    if (!line.trim()) {
                        if (inList && listItems.length > 0) {
                            elements.push(
                                <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                                    {listItems}
                                </ul>
                            );
                            listItems = [];
                            inList = false;
                        }
                        continue;
                    }
                    
                    // 标题
                    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
                    if (headerMatch) {
                        const level = headerMatch[1].length;
                        const text = headerMatch[2];
                        const HeaderTag = `h${level}`;
                        const sizes = {
                            1: 'text-2xl font-bold mt-6 mb-3',
                            2: 'text-xl font-bold mt-5 mb-2',
                            3: 'text-lg font-semibold mt-4 mb-2',
                            4: 'text-base font-semibold mt-3 mb-1',
                            5: 'text-sm font-semibold mt-2 mb-1',
                            6: 'text-sm font-medium mt-2 mb-1',
                        };
                        elements.push(
                            <HeaderTag key={key++} className={`${sizes[level]} text-[var(--color-text)]`}>
                                {renderInline(text)}
                            </HeaderTag>
                        );
                        continue;
                    }
                    
                    // 无序列表
                    const listMatch = line.match(/^[-*+]\s+(.+)$/);
                    if (listMatch) {
                        inList = true;
                        listItems.push(
                            <li key={`li-${key++}`} className="text-[var(--color-text)]">
                                {renderInline(listMatch[1])}
                            </li>
                        );
                        continue;
                    }
                    
                    // 有序列表
                    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
                    if (orderedMatch) {
                        if (inList && listItems.length > 0) {
                            elements.push(
                                <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                                    {listItems}
                                </ul>
                            );
                            listItems = [];
                        }
                        inList = true;
                        listItems.push(
                            <li key={`oli-${key++}`} className="text-[var(--color-text)]">
                                {renderInline(orderedMatch[2])}
                            </li>
                        );
                        continue;
                    }
                    
                    // 引用
                    const quoteMatch = line.match(/^>\s*(.*)$/);
                    if (quoteMatch) {
                        if (inList && listItems.length > 0) {
                            elements.push(
                                <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                                    {listItems}
                                </ul>
                            );
                            listItems = [];
                            inList = false;
                        }
                        elements.push(
                            <blockquote key={key++} className="border-l-4 border-[var(--color-primary)] pl-4 my-2 text-[var(--color-text-secondary)] italic">
                                {renderInline(quoteMatch[1])}
                            </blockquote>
                        );
                        continue;
                    }
                    
                    // 分隔线
                    if (/^[-*_]{3,}$/.test(line.trim())) {
                        if (inList && listItems.length > 0) {
                            elements.push(
                                <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                                    {listItems}
                                </ul>
                            );
                            listItems = [];
                            inList = false;
                        }
                        elements.push(
                            <hr key={key++} className="my-4 border-[var(--color-border)]" />
                        );
                        continue;
                    }
                    
                    // 普通段落
                    if (inList && listItems.length > 0) {
                        elements.push(
                            <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                                {listItems}
                            </ul>
                        );
                        listItems = [];
                        inList = false;
                    }
                    
                    elements.push(
                        <p key={key++} className="my-2 text-[var(--color-text)] leading-relaxed">
                            {renderInline(line)}
                        </p>
                    );
                }
                
                // 处理剩余的列表项
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={key++} className="list-disc list-inside my-2 space-y-1">
                            {listItems}
                        </ul>
                    );
                }
            }
        }
        
        return elements;
    }, [content]);
    
    return (
        <div className="markdown-content">
            {rendered}
        </div>
    );
}

// 渲染行内元素（粗体、斜体、链接、内联代码）
function renderInline(text) {
    if (!text) return null;
    
    const elements = [];
    let key = 0;
    let remaining = text;
    
    // 正则匹配各种内联语法
    const patterns = [
        // 链接 [text](url)
        { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (match) => (
            <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" 
               className="text-[var(--color-primary)] hover:underline">
                {match[1]}
            </a>
        )},
        // 粗体 **text**
        { regex: /\*\*([^*]+)\*\*/, render: (match) => (
            <strong key={key++} className="font-semibold">{match[1]}</strong>
        )},
        // 斜体 *text* 或 _text_
        { regex: /(?:\*|_)([^*_]+)(?:\*|_)/, render: (match) => (
            <em key={key++} className="italic">{match[1]}</em>
        )},
        // 内联代码 `code`
        { regex: /`([^`]+)`/, render: (match) => (
            <InlineCode key={key++}>{match[1]}</InlineCode>
        )},
    ];
    
    while (remaining) {
        let earliestMatch = null;
        let earliestIndex = remaining.length;
        let matchedPattern = null;
        
        // 找到最早出现的模式
        for (const pattern of patterns) {
            const match = remaining.match(pattern.regex);
            if (match && match.index < earliestIndex) {
                earliestMatch = match;
                earliestIndex = match.index;
                matchedPattern = pattern;
            }
        }
        
        if (earliestMatch && matchedPattern) {
            // 添加匹配前的文本
            if (earliestIndex > 0) {
                elements.push(remaining.slice(0, earliestIndex));
            }
            // 添加匹配的元素
            elements.push(matchedPattern.render(earliestMatch));
            // 继续处理剩余文本
            remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
        } else {
            // 没有更多匹配，添加剩余文本
            elements.push(remaining);
            break;
        }
    }
    
    return elements.length === 1 && typeof elements[0] === 'string' 
        ? elements[0] 
        : elements;
}

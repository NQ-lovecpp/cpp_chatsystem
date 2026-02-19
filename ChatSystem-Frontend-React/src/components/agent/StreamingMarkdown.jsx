/**
 * StreamingMarkdown - 流式 Markdown 渲染组件（统一气泡版）
 *
 * 支持渲染结构化 xmarkdown 内容：
 * - <think>思考内容</think> → 可折叠思考块
 * - <tool-call name="xxx" arguments='...'>...</tool-call> → 工具调用块
 * - <tool-result name="xxx" status="success">结果</tool-result> → 工具结果块
 * - 普通 markdown → 正常渲染
 * - Mermaid 图表支持
 */

import { memo, useEffect, useState, useMemo } from 'react';
import XMarkdown from '@ant-design/x-markdown';
import { Mermaid, Think } from '@ant-design/x';
import { ToolOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

/**
 * 代码块组件 - 支持 Mermaid 图表
 */
const CodeComponent = memo(function CodeComponent({ className, children }) {
    const lang = className?.match(/language-(\w+)/)?.[1] || '';

    if (typeof children !== 'string') return null;

    if (lang === 'mermaid') {
        return (
            <div style={{ margin: '8px 0', overflow: 'auto' }}>
                <Mermaid>{children}</Mermaid>
            </div>
        );
    }

    return (
        <pre style={{
            background: 'var(--color-surface)',
            padding: '10px 12px',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 12,
            lineHeight: 1.6,
            margin: '6px 0',
        }}>
            <code className={className}>{children}</code>
        </pre>
    );
});

/**
 * Think 组件 - 展示推理过程
 */
const ThinkComponent = memo(function ThinkComponent({ children, streamStatus }) {
    const [title, setTitle] = useState('思考中...');
    const [loading, setLoading] = useState(true);
    const [expand, setExpand] = useState(true);

    useEffect(() => {
        if (streamStatus === 'done') {
            setTitle('思考完成');
            setLoading(false);
            setExpand(false);
        }
    }, [streamStatus]);

    return (
        <Think
            title={title}
            loading={loading}
            expanded={expand}
            onClick={() => setExpand(v => !v)}
            style={{ marginBottom: 8 }}
        >
            {children}
        </Think>
    );
});

/**
 * ToolCallBlock - 工具调用展示块
 */
const ToolCallBlock = memo(function ToolCallBlock({ name, content, isStreaming }) {
    const [expanded, setExpanded] = useState(isStreaming);

    useEffect(() => {
        if (!isStreaming) setExpanded(false);
    }, [isStreaming]);

    return (
        <div style={{
            margin: '6px 0',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            fontSize: 12,
        }}>
            <div
                onClick={() => setExpanded(v => !v)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: 'var(--color-surface)',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                <ToolOutlined style={{ color: 'var(--color-primary)', fontSize: 13 }} />
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {name || '工具调用'}
                </span>
                {isStreaming && (
                    <span style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'var(--color-primary)',
                        color: '#fff',
                    }}>调用中</span>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 11 }}>
                    {expanded ? '▼' : '▶'}
                </span>
            </div>
            {expanded && content && (
                <div style={{
                    padding: '6px 10px',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: 200,
                    overflow: 'auto',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    {content}
                </div>
            )}
        </div>
    );
});

/**
 * ToolResultBlock - 工具结果展示块
 */
const ToolResultBlock = memo(function ToolResultBlock({ name, status, content, isStreaming }) {
    const [expanded, setExpanded] = useState(false);
    const isSuccess = status === 'success';

    return (
        <div style={{
            margin: '6px 0',
            border: `1px solid ${isSuccess ? 'var(--color-border)' : '#ff4d4f33'}`,
            borderRadius: 8,
            overflow: 'hidden',
            fontSize: 12,
        }}>
            <div
                onClick={() => setExpanded(v => !v)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: isSuccess ? 'var(--color-surface)' : '#fff1f0',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                {isSuccess
                    ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13 }} />
                    : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 13 }} />}
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {name || '工具结果'} — {isSuccess ? '成功' : '失败'}
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 11 }}>
                    {expanded ? '▼' : '▶'}
                </span>
            </div>
            {expanded && content && (
                <div style={{
                    padding: '6px 10px',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: 300,
                    overflow: 'auto',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    {content}
                </div>
            )}
        </div>
    );
});

// --- 解析 xmarkdown 为 sections ---

const SECTION_REGEX = /<tool-call\s+name="([^"]*)"(?:\s+arguments='([^']*)')?\s*>([\s\S]*?)<\/tool-call>|<tool-result\s+name="([^"]*)"(?:\s+status="([^"]*)")?\s*>([\s\S]*?)<\/tool-result>/g;

function parseXMarkdown(content) {
    if (!content) return [];

    const sections = [];
    let lastIndex = 0;

    // Reset lastIndex
    SECTION_REGEX.lastIndex = 0;

    let match;
    while ((match = SECTION_REGEX.exec(content)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            const text = content.slice(lastIndex, match.index).trim();
            if (text) sections.push({ type: 'markdown', content: text });
        }

        if (match[1] !== undefined) {
            // tool-call
            const args = match[2] || '';
            const inner = match[3] || '';
            sections.push({
                type: 'tool-call',
                name: match[1],
                content: args + inner,
            });
        } else if (match[4] !== undefined) {
            // tool-result
            sections.push({
                type: 'tool-result',
                name: match[4],
                status: match[5] || 'success',
                content: match[6]?.trim() || '',
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining text after last match
    if (lastIndex < content.length) {
        const text = content.slice(lastIndex).trim();
        if (text) sections.push({ type: 'markdown', content: text });
    }

    return sections;
}

/**
 * StreamingMarkdown
 *
 * @param {string} content - 结构化 xmarkdown 内容
 * @param {boolean} isStreaming - 是否正在流式输出
 * @param {string} className - 额外 CSS class
 */
export default function StreamingMarkdown({ content, isStreaming = false, className = '' }) {
    const sections = useMemo(() => parseXMarkdown(content), [content]);

    const mdComponents = useMemo(() => ({
        code: CodeComponent,
        think: (props) => <ThinkComponent {...props} streamStatus={isStreaming ? 'loading' : 'done'} />,
    }), [isStreaming]);

    if (!content && isStreaming) {
        return (
            <span className="text-[var(--color-text-muted)] italic text-sm">思考中...</span>
        );
    }

    if (!content) {
        return null;
    }

    // If no tool sections found, render as pure markdown (fast path)
    if (sections.length <= 1 && sections[0]?.type === 'markdown') {
        return (
            <div className={`text-sm leading-relaxed ${className}`}>
                <XMarkdown
                    components={mdComponents}
                    paragraphTag="div"
                    streaming={{ hasNextChunk: isStreaming }}
                >
                    {content}
                </XMarkdown>
            </div>
        );
    }

    // Render mixed content sections
    return (
        <div className={`text-sm leading-relaxed ${className}`}>
            {sections.map((section, i) => {
                const isLast = i === sections.length - 1;
                const sectionStreaming = isStreaming && isLast;

                if (section.type === 'markdown') {
                    return (
                        <XMarkdown
                            key={i}
                            components={mdComponents}
                            paragraphTag="div"
                            streaming={{ hasNextChunk: sectionStreaming }}
                        >
                            {section.content}
                        </XMarkdown>
                    );
                }

                if (section.type === 'tool-call') {
                    return (
                        <ToolCallBlock
                            key={i}
                            name={section.name}
                            content={section.content}
                            isStreaming={sectionStreaming}
                        />
                    );
                }

                if (section.type === 'tool-result') {
                    return (
                        <ToolResultBlock
                            key={i}
                            name={section.name}
                            status={section.status}
                            content={section.content}
                            isStreaming={sectionStreaming}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}

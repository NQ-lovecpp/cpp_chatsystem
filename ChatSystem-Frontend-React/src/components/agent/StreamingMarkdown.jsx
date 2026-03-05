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

import { memo, useState, useMemo } from 'react';
import XMarkdown from '@ant-design/x-markdown';
import { Mermaid, Think, ThoughtChain } from '@ant-design/x';
import { ToolOutlined, BulbOutlined } from '@ant-design/icons';
import '@ant-design/x-markdown/themes/dark.css';
import { useTheme } from '../../contexts/ThemeContext';

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
    const [doneExpanded, setDoneExpanded] = useState(false);

    const isDone = streamStatus === 'done';
    const title = isDone ? '思考完成' : '思考中...';
    const loading = !isDone;
    const expanded = isDone ? doneExpanded : true;
    const titleNode = <span style={{ color: 'var(--color-text)' }}>{title}</span>;

    return (
        <Think
            title={titleNode}
            blink={loading}
            loading={loading}
            icon={<BulbOutlined style={{ color: 'var(--color-text-secondary)' }} />}
            expanded={expanded}
            onClick={() => {
                if (isDone) {
                    setDoneExpanded(v => !v);
                }
            }}
            style={{
                marginBottom: 8,
                color: 'var(--color-text)',
            }}
        >
            <div style={{ color: 'var(--color-text-secondary)' }}>{children}</div>
        </Think>
    );
});

/**
 * 格式化工具参数为可读形式
 */
function formatToolArguments(name, rawArgs) {
    if (!rawArgs) return null;
    try {
        const parsed = JSON.parse(rawArgs);
        if (name === 'python_execute' && parsed.code) {
            return { type: 'code', language: 'python', code: parsed.code };
        }
        return { type: 'json', data: parsed, formatted: JSON.stringify(parsed, null, 2) };
    } catch {
        return { type: 'text', text: rawArgs };
    }
}

/**
 * 解析 todo 工具返回的 JSON 结果
 */
function parseTodoResult(content) {
    if (!content) return null;
    try {
        const data = JSON.parse(content);
        if (data.type === 'todo_list' || data.type === 'todo_update') return data;
    } catch { /* not JSON, ignore */ }
    return null;
}

const TODO_STATUS_STYLE = {
    idle: { bg: 'transparent', border: 'var(--color-border)', check: false, strike: false, spin: false },
    pending: { bg: 'transparent', border: 'var(--color-border)', check: false, strike: false, spin: false },
    running: { bg: 'transparent', border: '#1677ff', check: false, strike: false, spin: true },
    completed: { bg: '#1677ff', border: '#1677ff', check: true, strike: true, spin: false },
    failed: { bg: '#ff4d4f', border: '#ff4d4f', check: false, strike: false, spin: false },
    skipped: { bg: 'transparent', border: 'var(--color-border)', check: false, strike: true, spin: false },
};

/**
 * TodoCardBlock - Todo 列表内联卡片
 */
const TodoCardBlock = memo(function TodoCardBlock({ data }) {
    const title = data.title || 'Agent Todos';
    const todos = data.todos || [];
    const progress = data.progress || { completed: 0, total: todos.length, percent: 0 };

    return (
        <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: '14px 16px',
            margin: '6px 0',
            background: 'var(--color-bg-elevated, var(--color-surface))',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✔</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        Progress {progress.percent ?? Math.round((progress.completed / (progress.total || 1)) * 100)}%
                    </span>
                    <div style={{
                        width: 60, height: 6, borderRadius: 3,
                        background: 'var(--color-border)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${progress.percent ?? Math.round((progress.completed / (progress.total || 1)) * 100)}%`,
                            height: '100%', borderRadius: 3,
                            background: '#1677ff',
                            transition: 'width 0.3s',
                        }} />
                    </div>
                </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}>Progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todos.map((todo, idx) => {
                    const st = TODO_STATUS_STYLE[todo.status] || TODO_STATUS_STYLE.idle;
                    return (
                        <div key={todo.id || idx} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 0',
                            borderBottom: idx < todos.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                border: `2px solid ${st.border}`,
                                background: st.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {st.check && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {st.spin && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                                        <circle cx="12" cy="12" r="10" stroke="#1677ff" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                                    </svg>
                                )}
                                {todo.status === 'failed' && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                )}
                            </div>
                            <span style={{
                                fontSize: 13,
                                color: st.strike ? 'var(--color-text-muted, #999)' : 'var(--color-text)',
                                textDecoration: st.strike ? 'line-through' : 'none',
                            }}>
                                {todo.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

/**
 * ToolEventBlock - 工具调用与结果合并展示
 */
const ToolEventBlock = memo(function ToolEventBlock({ event, isStreamingTail = false }) {
    const isPending = !event.result && (event.inProgress || isStreamingTail);
    const isSuccess = event.result?.status === 'success';
    const hasResult = !!event.result;

    // Check if result is a todo card
    const todoData = hasResult ? parseTodoResult(event.result.content) : null;
    if (todoData) {
        return <TodoCardBlock data={todoData} />;
    }

    const title = isPending
        ? `Calling: ${event.name || 'tool'}`
        : `Called: ${event.name || 'tool'}`;
    const description = ``;
    const status = isPending ? undefined : (isSuccess ? 'success' : 'error');
    const key = `tool-${event.name || 'tool'}-${hasResult ? 'done' : 'pending'}`;
    const [doneExpandedKeys, setDoneExpandedKeys] = useState([]);
    const expandedKeys = isPending ? [key] : doneExpandedKeys;

    const formattedArgs = useMemo(
        () => formatToolArguments(event.name, event.arguments),
        [event.name, event.arguments]
    );

    const detailBlocks = [];
    if (formattedArgs) {
        if (formattedArgs.type === 'code') {
            detailBlocks.push(
                <div key={`${key}-args`}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, color: 'var(--color-text)' }}>Code</div>
                    <pre style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        maxHeight: 200,
                        overflowY: 'auto',
                        fontSize: 12,
                        lineHeight: 1.6,
                        margin: 0,
                        color: 'var(--color-text-secondary)',
                    }}>
                        <code>{formattedArgs.code}</code>
                    </pre>
                </div>
            );
        } else if (formattedArgs.type === 'json') {
            detailBlocks.push(
                <div
                    key={`${key}-args`}
                    style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        maxHeight: 140,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: 'var(--color-text-secondary)',
                        fontSize: 12,
                        fontFamily: 'monospace',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>Arguments</div>
                    {formattedArgs.formatted}
                </div>
            );
        } else {
            detailBlocks.push(
                <div
                    key={`${key}-args`}
                    style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        maxHeight: 140,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: 'var(--color-text-secondary)',
                        fontSize: 12,
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>Arguments</div>
                    {formattedArgs.text}
                </div>
            );
        }
    }
    if (hasResult) {
        detailBlocks.push(
            <div
                key={`${key}-result`}
                style={{
                    border: `1px solid ${isSuccess ? 'var(--color-border)' : 'rgba(255,77,79,0.35)'}`,
                    borderRadius: 8,
                    padding: '8px 10px',
                    maxHeight: 220,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'var(--color-text-secondary)',
                    fontSize: 12,
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>
                    {`Result (${event.result.status || 'success'})`}
                </div>
                {event.result.content || ''}
            </div>
        );
    }

    return (
        <div style={{ margin: '6px 0' }}>
            <ThoughtChain
                items={[
                    {
                        key,
                        title,
                        description,
                        icon: <ToolOutlined />,
                        variant: 'outlined',
                        status,
                        blink: isPending,
                        collapsible: detailBlocks.length > 0,
                        content: detailBlocks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {detailBlocks}
                            </div>
                        ) : null,
                    },
                ]}
                expandedKeys={expandedKeys}
                onExpand={(keys) => {
                    if (!isPending) {
                        setDoneExpandedKeys(keys);
                    }
                }}
            />
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

function parseThinkSections(content) {
    if (!content) return [];

    const sections = [];
    const tokenRegex = /<think(?:\s+[^>]*)?>|<\/think>/gi;
    let cursor = 0;
    let inThink = false;
    let thinkStart = -1;
    let match;

    while ((match = tokenRegex.exec(content)) !== null) {
        const token = match[0].toLowerCase();
        const isClose = token.startsWith('</think');
        const idx = match.index;

        if (!inThink && !isClose) {
            if (idx > cursor) {
                const before = content.slice(cursor, idx);
                if (before.trim()) {
                    sections.push({ type: 'markdown', content: before });
                }
            }
            inThink = true;
            thinkStart = tokenRegex.lastIndex;
        } else if (inThink && isClose) {
            sections.push({
                type: 'think',
                content: content.slice(thinkStart, idx),
                complete: true,
            });
            inThink = false;
            thinkStart = -1;
            cursor = tokenRegex.lastIndex;
        }
    }

    if (inThink && thinkStart >= 0) {
        sections.push({
            type: 'think',
            content: content.slice(thinkStart),
            complete: false,
        });
    } else if (cursor < content.length) {
        const tail = content.slice(cursor);
        if (tail.trim()) {
            sections.push({ type: 'markdown', content: tail });
        }
    }

    return sections;
}

function mergeToolSections(sections) {
    const merged = [];

    for (let i = 0; i < sections.length; i += 1) {
        const section = sections[i];
        if (section.type !== 'tool-call') {
            merged.push(section);
            continue;
        }

        const next = sections[i + 1];
        if (next?.type === 'tool-result' && next.name === section.name) {
            merged.push({
                type: 'tool-event',
                name: section.name,
                arguments: section.content || '',
                result: {
                    status: next.status || 'success',
                    content: next.content || '',
                },
                inProgress: false,
            });
            i += 1;
        } else {
            merged.push({
                type: 'tool-event',
                name: section.name,
                arguments: section.content || '',
                result: null,
                inProgress: true,
            });
        }
    }

    return merged;
}

function buildRenderSections(content) {
    const thinkSections = parseThinkSections(content);
    const merged = [];

    for (const section of thinkSections) {
        if (section.type === 'think') {
            merged.push(section);
            continue;
        }
        merged.push(...mergeToolSections(parseXMarkdown(section.content)));
    }

    return merged;
}

/**
 * StreamingMarkdown
 *
 * @param {string} content - 结构化 xmarkdown 内容
 * @param {boolean} isStreaming - 是否正在流式输出
 * @param {string} className - 额外 CSS class
 */
export default function StreamingMarkdown({ content, isStreaming = false, className = '' }) {
    const { isDark } = useTheme();
    const sections = useMemo(() => buildRenderSections(content), [content]);

    const mdComponents = useMemo(() => ({
        code: CodeComponent,
    }), []);

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
            <div className={`text-sm leading-relaxed text-[var(--color-text)] ${className}`}>
                <XMarkdown
                    className={isDark ? 'x-markdown-dark' : undefined}
                    components={mdComponents}
                    paragraphTag="div"
                    streaming={{ hasNextChunk: isStreaming }}
                    style={{ color: 'var(--color-text)' }}
                >
                    {content}
                </XMarkdown>
            </div>
        );
    }

    // Render mixed content sections
    return (
        <div className={`text-sm leading-relaxed text-[var(--color-text)] ${className}`}>
            {sections.map((section, i) => {
                const isLast = i === sections.length - 1;
                const sectionStreaming = isStreaming && isLast;

                if (section.type === 'markdown') {
                    return (
                        <XMarkdown
                            key={i}
                            className={isDark ? 'x-markdown-dark' : undefined}
                            components={mdComponents}
                            paragraphTag="div"
                            streaming={{ hasNextChunk: sectionStreaming }}
                            style={{ color: 'var(--color-text)' }}
                        >
                            {section.content}
                        </XMarkdown>
                    );
                }

                if (section.type === 'tool-event') {
                    return (
                        <ToolEventBlock
                            key={i}
                            event={section}
                            isStreamingTail={sectionStreaming}
                        />
                    );
                }

                if (section.type === 'think') {
                    const thinkLoading = !section.complete;
                    return (
                        <ThinkComponent
                            key={i}
                            streamStatus={thinkLoading ? 'loading' : 'done'}
                        >
                            <XMarkdown
                                className={isDark ? 'x-markdown-dark' : undefined}
                                components={mdComponents}
                                paragraphTag="div"
                                streaming={{ hasNextChunk: thinkLoading && isStreaming }}
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {section.content || ''}
                            </XMarkdown>
                        </ThinkComponent>
                    );
                }

                return null;
            })}
        </div>
    );
}

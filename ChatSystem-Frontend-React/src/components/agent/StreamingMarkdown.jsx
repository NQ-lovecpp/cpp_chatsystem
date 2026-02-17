/**
 * StreamingMarkdown - 流式 Markdown 渲染组件
 * 基于 @ant-design/x-markdown (XMarkdown) 实现：
 * - streaming: { hasNextChunk } 控制流式光标
 * - Think 组件展示 <think> 推理过程
 * - Mermaid 图表支持
 */

import { memo, useEffect, useState } from 'react';
import XMarkdown from '@ant-design/x-markdown';
import { Mermaid, Think } from '@ant-design/x';

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
 * streamStatus='loading' 表示还在流式输出中
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
 * StreamingMarkdown
 *
 * @param {string} content - Markdown 内容
 * @param {boolean} isStreaming - 是否正在流式输出（控制 hasNextChunk）
 * @param {string} className - 额外 CSS class
 */
export default function StreamingMarkdown({ content, isStreaming = false, className = '' }) {
    // XMarkdown components
    const components = {
        code: CodeComponent,
        think: (props) => <ThinkComponent {...props} streamStatus={isStreaming ? 'loading' : 'done'} />,
    };

    if (!content && isStreaming) {
        return (
            <span className="text-[var(--color-text-muted)] italic text-sm">思考中...</span>
        );
    }

    if (!content) {
        return null;
    }

    return (
        <div className={`text-sm leading-relaxed ${className}`}>
            <XMarkdown
                components={components}
                paragraphTag="div"
                streaming={{ hasNextChunk: isStreaming }}
            >
                {content}
            </XMarkdown>
        </div>
    );
}

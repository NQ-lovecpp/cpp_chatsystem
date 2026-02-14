/**
 * StreamingMarkdown - 流式 Markdown 渲染组件
 * 支持实时渲染流式输入的 Markdown 内容
 * 使用 CSS 变量适配深浅色模式
 */

import ReactMarkdown from 'react-markdown';

// 自定义渲染组件 - 使用 CSS class 适配主题
const components = {
    p: ({ children }) => (
        <p className="mb-2 leading-relaxed text-inherit">{children}</p>
    ),
    
    h1: ({ children }) => (
        <h1 className="text-xl font-semibold my-4 text-[var(--color-text)]">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-lg font-semibold my-3 text-[var(--color-text)]">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-base font-semibold my-2 text-[var(--color-text)]">{children}</h3>
    ),
    
    ul: ({ children }) => (
        <ul className="my-2 pl-5 list-disc">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 pl-5 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="my-1 leading-relaxed">{children}</li>
    ),
    
    code: ({ inline, className, children, ...props }) => {
        if (inline) {
            return (
                <code 
                    className="bg-[var(--color-surface)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--color-text)]"
                    {...props}
                >
                    {children}
                </code>
            );
        }
        
        const language = className?.replace('language-', '') || '';
        return (
            <div className="relative my-2">
                {language && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-[var(--color-border)] rounded-bl text-[11px] text-[var(--color-text-muted)]">
                        {language}
                    </div>
                )}
                <pre className="bg-[var(--color-surface)] p-3 rounded-lg overflow-auto text-sm font-mono text-[var(--color-text-secondary)]">
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        );
    },
    
    blockquote: ({ children }) => (
        <blockquote className="my-2 px-4 py-2 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)] rounded-r">
            {children}
        </blockquote>
    ),
    
    a: ({ href, children }) => (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
        >
            {children}
        </a>
    ),
    
    strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
    ),
    
    em: ({ children }) => (
        <em className="italic">{children}</em>
    ),
    
    hr: () => (
        <hr className="border-none border-t border-[var(--color-border)] my-4" />
    ),
    
    table: ({ children }) => (
        <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse text-sm">
                {children}
            </table>
        </div>
    ),
    th: ({ children }) => (
        <th className="px-3 py-2 border-b-2 border-[var(--color-border)] text-left font-semibold bg-[var(--color-surface)] text-[var(--color-text)]">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-3 py-2 border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
            {children}
        </td>
    ),
};

export default function StreamingMarkdown({ content, className = '' }) {
    if (!content) {
        return (
            <span className="text-[var(--color-text-muted)] italic text-sm">
                思考中...
            </span>
        );
    }

    return (
        <div className={`text-sm leading-relaxed ${className}`}>
            <ReactMarkdown components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

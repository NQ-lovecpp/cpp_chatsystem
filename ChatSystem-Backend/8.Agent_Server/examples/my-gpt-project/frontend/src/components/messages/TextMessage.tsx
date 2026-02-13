'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/LoadingEffects';

type TextMessageProps = {
  text: string;
  isUser: boolean;
};

/**
 * Code block component for Markdown rendering
 */
function MarkdownCodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: any;
}) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code - simple styling
  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 text-zinc-800 text-[13px] font-mono border border-zinc-200"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Code block - with syntax highlighting
  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '13px',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Custom link component
 */
function MarkdownLink({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
    >
      {children}
      <ExternalLink size={11} className="inline-block flex-shrink-0" />
    </a>
  );
}

/**
 * Markdown rendering component
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks - handle both inline and block
        code: ({ inline, className, children, ...props }: any) => {
          // Force inline detection for single-line content without language
          const isInline = inline || (!className && !String(children).includes('\n'));
          return (
            <MarkdownCodeBlock
              inline={isInline}
              className={className}
              {...props}
            >
              {children}
            </MarkdownCodeBlock>
          );
        },
        // Links
        a: MarkdownLink as any,
        // Paragraphs
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
        // Headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-5 mb-3 text-zinc-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mt-4 mb-2 text-zinc-900">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-3 mb-2 text-zinc-800">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold mt-3 mb-1 text-zinc-800">{children}</h4>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="text-zinc-700 leading-relaxed">{children}</li>,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-zinc-300 pl-4 italic text-zinc-600 my-3">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="my-4 border-zinc-200" />,
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-zinc-200 rounded-lg overflow-hidden text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-50">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-zinc-200 last:border-b-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-sm font-semibold text-zinc-700 border-r border-zinc-200 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm text-zinc-600 border-r border-zinc-200 last:border-r-0">
            {children}
          </td>
        ),
        // Strikethrough
        del: ({ children }) => (
          <del className="text-zinc-400 line-through">{children}</del>
        ),
        // Emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * Text message component
 */
export function TextMessage({ text, isUser }: TextMessageProps) {
  // Don't render empty messages
  if (!text || text.trim() === '') {
    return null;
  }

  return (
    <FadeIn>
      <div
        className={cn('flex flex-col', {
          'items-end': isUser,
          'items-start': !isUser,
        })}
      >
        <div
          className={cn('rounded-2xl', {
            // User message style
            'px-4 py-2.5 max-w-[70%] text-zinc-900 bg-zinc-100': isUser,
            // AI message style
            'max-w-full text-zinc-800': !isUser,
          })}
        >
          {isUser ? (
            <span className="text-[15px] leading-relaxed">{text}</span>
          ) : (
            <div className="prose prose-sm prose-zinc max-w-none text-[15px]">
              <MarkdownContent content={text} />
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

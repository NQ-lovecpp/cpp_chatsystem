/**
 * Agent 消息渲染组件
 * 
 * 使用 Ant Design X 的 XMarkdown 组件渲染 Agent 消息：
 * - 支持 Mermaid 图表
 * - 支持思考过程展示 (Think)
 * - 支持代码高亮
 * - 支持引用来源
 */

import { useState, useEffect, useMemo, memo } from 'react';
import { Bubble, Mermaid, Think } from '@ant-design/x';
import XMarkdown from '@ant-design/x-markdown';
import { Collapse, Typography, Tag, Tooltip, Spin } from 'antd';
import { 
  BulbOutlined, 
  CodeOutlined, 
  LinkOutlined,
  LoadingOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * 代码块渲染组件 - 支持 Mermaid
 */
const CodeComponent = memo(function CodeComponent({ className, children }) {
  const lang = className?.match(/language-(\w+)/)?.[1] || '';
  
  if (typeof children !== 'string') return null;
  
  // Mermaid 图表
  if (lang === 'mermaid') {
    return (
      <div style={{ margin: '12px 0', overflow: 'auto' }}>
        <Mermaid>{children}</Mermaid>
      </div>
    );
  }
  
  // 普通代码块
  return (
    <pre style={{ 
      background: '#f6f8fa', 
      padding: '12px', 
      borderRadius: 8,
      overflow: 'auto',
      fontSize: 13,
      lineHeight: 1.5
    }}>
      <code className={className}>{children}</code>
    </pre>
  );
});

/**
 * 思考过程组件
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
      onClick={() => setExpand(!expand)}
      style={{ marginBottom: 8 }}
    >
      {children}
    </Think>
  );
});

/**
 * 引用来源组件
 */
const ReferenceComponent = memo(function ReferenceComponent({ href, children }) {
  return (
    <Tooltip title={href}>
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          color: '#1890ff',
          textDecoration: 'none',
          borderBottom: '1px dashed #1890ff'
        }}
      >
        <LinkOutlined style={{ marginRight: 4 }} />
        {children}
      </a>
    </Tooltip>
  );
});

/**
 * Agent 消息渲染器
 * 
 * @param {object} props
 * @param {string} props.content - 消息内容（Markdown 格式）
 * @param {string} props.thinking - 思考过程内容（可选）
 * @param {string} props.streamStatus - 流式状态: 'streaming' | 'done'
 * @param {boolean} props.isStreaming - 是否正在流式输出
 * @param {array} props.toolCalls - 工具调用记录（可选）
 * @param {object} props.metadata - 消息元数据（可选）
 */
export default function AgentMessageRenderer({ 
  content = '',
  thinking = '',
  streamStatus = 'done',
  isStreaming = false,
  toolCalls = [],
  metadata = {}
}) {
  // 组合内容：如果有思考过程，添加 <think> 标签
  const renderedContent = useMemo(() => {
    let finalContent = content || '';
    
    // 如果有思考过程，包装在 think 标签中
    if (thinking) {
      finalContent = `<think>${thinking}</think>\n\n${finalContent}`;
    }
    
    return finalContent;
  }, [content, thinking]);

  // XMarkdown 组件配置
  const markdownComponents = useMemo(() => ({
    code: CodeComponent,
    think: (props) => <ThinkComponent {...props} streamStatus={streamStatus} />,
    a: ReferenceComponent,
  }), [streamStatus]);

  // 空内容处理
  if (!renderedContent && !isStreaming) {
    return null;
  }

  return (
    <div className="agent-message-renderer">
      {/* 流式输出指示器 */}
      {isStreaming && (
        <div style={{ marginBottom: 8 }}>
          <Spin indicator={<LoadingOutlined spin />} size="small" />
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            AI 正在思考...
          </Text>
        </div>
      )}

      {/* 主内容渲染 */}
      <XMarkdown 
        components={markdownComponents}
        paragraphTag="div"
      >
        {renderedContent}
      </XMarkdown>

      {/* 工具调用记录 */}
      {toolCalls?.length > 0 && (
        <Collapse
          ghost
          size="small"
          style={{ marginTop: 12 }}
          items={[{
            key: 'tool-calls',
            label: (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CodeOutlined style={{ marginRight: 4 }} />
                {toolCalls.length} 个工具调用
              </Text>
            ),
            children: (
              <div style={{ fontSize: 12 }}>
                {toolCalls.map((call, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '8px 12px', 
                      background: '#f5f5f5', 
                      borderRadius: 6,
                      marginBottom: 8 
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      <Tag color="blue">{call.tool_name}</Tag>
                    </div>
                    {call.result && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {call.result.substring(0, 200)}
                        {call.result.length > 200 && '...'}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            )
          }]}
        />
      )}

      {/* 模型信息 */}
      {metadata?.model && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#999' }}>
          <Tag size="small" style={{ fontSize: 10 }}>
            {metadata.model}
          </Tag>
          {metadata.provider && (
            <Text type="secondary" style={{ marginLeft: 4 }}>
              via {metadata.provider}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 用于 Bubble 组件的 contentRender
 */
export function createAgentContentRenderer(options = {}) {
  return function AgentContentRenderer(content) {
    return (
      <AgentMessageRenderer 
        content={content}
        {...options}
      />
    );
  };
}

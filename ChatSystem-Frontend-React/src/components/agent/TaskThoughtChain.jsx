/**
 * 任务思维链组件
 * 
 * 使用 Ant Design X 的 ThoughtChain 组件展示：
 * - 任务执行步骤
 * - 工具调用过程
 * - 思考/推理过程
 * - 执行结果
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  CodeOutlined, 
  SearchOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  BulbOutlined,
  ToolOutlined,
  GlobalOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Think, ThoughtChain } from '@ant-design/x';
import { Card, Typography, Tag, Flex, Spin, Empty } from 'antd';

const { Text, Paragraph } = Typography;

// 节点类型图标映射
const NODE_TYPE_ICONS = {
  reasoning: <BulbOutlined style={{ color: '#faad14' }} />,
  tool_call: <ToolOutlined style={{ color: '#1890ff' }} />,
  tool_output: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  result: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
  error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
};

// 工具名称图标映射
const TOOL_ICONS = {
  web_search: <SearchOutlined />,
  web_open: <GlobalOutlined />,
  web_find: <FileTextOutlined />,
  python_execute: <CodeOutlined />,
  get_chat_history: <FileTextOutlined />,
  add_todos: <CheckCircleOutlined />,
  update_todo: <CheckCircleOutlined />,
  create_task: <ThunderboltOutlined />,
};

// 状态颜色映射
const STATUS_MAP = {
  pending: undefined,
  running: undefined,
  success: 'success',
  error: 'error',
};

/**
 * 将后端 ThoughtChain 数据转换为组件格式
 */
function transformChainData(nodes) {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map((node, index) => {
    const icon = NODE_TYPE_ICONS[node.node_type] || <ToolOutlined />;
    const status = STATUS_MAP[node.status];
    
    // 构建内容
    let content = null;
    
    if (node.node_type === 'reasoning' && node.content) {
      // 推理节点使用 Think 组件
      content = (
        <Think 
          title="思考过程"
          loading={node.status === 'running'}
          expanded={node.status === 'running'}
        >
          <Paragraph 
            style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}
            ellipsis={{ rows: 10, expandable: true }}
          >
            {node.content}
          </Paragraph>
        </Think>
      );
    } else if (node.node_type === 'tool_call') {
      // 工具调用节点
      const toolIcon = TOOL_ICONS[node.title?.replace('调用工具: ', '')] || <ToolOutlined />;
      content = (
        <Flex gap="small" vertical>
          {node.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {node.description}
            </Text>
          )}
          {node.content && (
            <pre style={{ 
              margin: 0, 
              padding: 8, 
              background: '#f5f5f5', 
              borderRadius: 4,
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 200
            }}>
              {node.content.substring(0, 1000)}
              {node.content.length > 1000 && '...'}
            </pre>
          )}
        </Flex>
      );
    } else if (node.node_type === 'result') {
      // 结果节点
      content = (
        <Paragraph 
          style={{ margin: 0, fontSize: 13 }}
          ellipsis={{ rows: 5, expandable: true }}
        >
          {node.content || node.description}
        </Paragraph>
      );
    } else if (node.node_type === 'error') {
      // 错误节点
      content = (
        <Text type="danger" style={{ fontSize: 13 }}>
          {node.content || node.description}
        </Text>
      );
    }
    
    return {
      key: node.chain_id || `node-${index}`,
      title: node.title || '处理中',
      description: node.description,
      icon: node.status === 'running' ? <LoadingOutlined spin /> : icon,
      status,
      collapsible: node.node_type === 'reasoning' || (node.content && node.content.length > 100),
      content,
    };
  });
}

/**
 * 任务思维链组件
 * 
 * @param {object} props
 * @param {string} props.taskId - 任务 ID
 * @param {array} props.chainNodes - 思维链节点列表
 * @param {boolean} props.loading - 是否加载中
 * @param {string} props.title - 标题
 */
export default function TaskThoughtChain({
  taskId,
  chainNodes = [],
  loading = false,
  title = '执行过程'
}) {
  // 转换数据格式
  const items = useMemo(() => transformChainData(chainNodes), [chainNodes]);

  if (loading && items.length === 0) {
    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Flex justify="center" align="center" style={{ padding: 24 }}>
          <Spin tip="加载中..." />
        </Flex>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无执行记录"
        />
      </Card>
    );
  }

  return (
    <Card 
      size="small" 
      title={
        <Flex align="center" gap={8}>
          <ThunderboltOutlined />
          <span>{title}</span>
          <Tag color="blue">{items.length} 步</Tag>
        </Flex>
      }
      style={{ marginBottom: 16 }}
    >
      <ThoughtChain 
        items={items} 
        line="dashed"
        style={{ padding: '8px 0' }}
      />
    </Card>
  );
}

/**
 * 实时 ThoughtChain 组件（支持流式更新）
 */
export function LiveThoughtChain({ taskId, onUpdate }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 可以通过 SSE 或轮询获取更新
  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [taskId]);

  // 添加节点的方法（供外部调用）
  const addNode = (node) => {
    setNodes(prev => [...prev, node]);
    onUpdate?.(node);
  };

  // 更新节点状态的方法
  const updateNodeStatus = (chainId, status, content) => {
    setNodes(prev => prev.map(n => 
      n.chain_id === chainId 
        ? { ...n, status, content: content || n.content }
        : n
    ));
  };

  return (
    <TaskThoughtChain
      taskId={taskId}
      chainNodes={nodes}
      loading={loading}
    />
  );
}

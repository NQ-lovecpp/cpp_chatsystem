/**
 * 任务思维链组件
 *
 * 使用 Ant Design X 的嵌套 ThoughtChain 模式展示：
 * - 顶层 ThoughtChain items（工具调用、推理、结果等）
 * - 每个 item 的 content 内嵌套 ThoughtChain.Item（子步骤）
 * - reasoning 节点用 Think 组件包裹
 */

import { useMemo } from 'react';
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
  ThunderboltOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Think, ThoughtChain } from '@ant-design/x';
import { Flex, Typography, Empty } from 'antd';

const { Text } = Typography;

// 工具名称 → 图标
const TOOL_ICONS = {
  web_search: <SearchOutlined />,
  web_open: <GlobalOutlined />,
  web_find: <FileTextOutlined />,
  python_execute: <CodeOutlined />,
  python_execute_with_approval: <CodeOutlined />,
  get_chat_history: <DatabaseOutlined />,
  get_session_members: <DatabaseOutlined />,
  get_user_info: <DatabaseOutlined />,
  search_messages: <DatabaseOutlined />,
  get_user_sessions: <DatabaseOutlined />,
  add_todos: <CheckCircleOutlined />,
  update_todo: <CheckCircleOutlined />,
  list_todos: <CheckCircleOutlined />,
};

// 节点类型图标
const NODE_TYPE_ICONS = {
  reasoning: <BulbOutlined style={{ color: '#faad14' }} />,
  tool_call: <ToolOutlined style={{ color: '#1890ff' }} />,
  result: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
  error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
};

// 状态 → ThoughtChain status
const STATUS_MAP = {
  running: undefined,
  success: 'success',
  error: 'error',
  pending: undefined,
};

/**
 * 将节点转换为 ThoughtChain items 格式
 */
function transformNodes(nodes) {
  if (!nodes || !Array.isArray(nodes)) return [];

  return nodes.map((node, index) => {
    const isRunning = node.status === 'running';

    // 顶层图标
    const typeIcon = NODE_TYPE_ICONS[node.node_type] || <ToolOutlined />;
    const icon = isRunning ? <LoadingOutlined spin style={{ color: '#1890ff' }} /> : typeIcon;

    // 工具名（从 title 解析）
    const toolName = node.title?.replace('调用工具: ', '')?.replace('任务管理: ', '') || '';
    const toolIcon = TOOL_ICONS[toolName];

    // 构建 content
    let content = null;

    if (node.node_type === 'reasoning') {
      // 推理节点 → Think 组件
      content = node.content || node.description ? (
        <Think
          title={isRunning ? '正在思考...' : '思考完成'}
          loading={isRunning}
          expanded={isRunning}
        >
          {(node.content || node.description || '').trim()}
        </Think>
      ) : null;

    } else if (node.node_type === 'tool_call') {
      // 工具调用节点 → 嵌套 ThoughtChain.Item
      content = (
        <Flex gap="small" vertical>
          {node.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {node.description}
            </Text>
          )}
          {node.content && (
            <ThoughtChain.Item
              variant="solid"
              icon={toolIcon || <FileTextOutlined />}
              title="执行结果"
              description={
                node.content.length > 300
                  ? node.content.slice(0, 300) + '...'
                  : node.content
              }
              status={node.status === 'success' ? 'success' : undefined}
            />
          )}
        </Flex>
      );

    } else if (node.node_type === 'result') {
      // 结果节点
      content = (node.content || node.description) ? (
        <Flex gap="small" vertical>
          <ThoughtChain.Item
            variant="solid"
            icon={<ThunderboltOutlined />}
            title="执行结果"
            description={
              ((node.content || node.description) || '').length > 300
                ? (node.content || node.description).slice(0, 300) + '...'
                : (node.content || node.description)
            }
            status="success"
          />
        </Flex>
      ) : null;

    } else if (node.node_type === 'error') {
      // 错误节点
      content = (node.content || node.description) ? (
        <ThoughtChain.Item
          variant="solid"
          icon={<ExclamationCircleOutlined />}
          title="错误信息"
          description={node.content || node.description}
          status="error"
        />
      ) : null;
    }

    return {
      key: node.chain_id || `node-${index}`,
      title: node.title || '处理中',
      description: node.node_type !== 'tool_call' ? node.description : undefined,
      icon,
      status: STATUS_MAP[node.status],
      collapsible: node.node_type === 'reasoning' || !!node.content,
      content,
    };
  });
}

/**
 * 任务思维链组件
 *
 * @param {object} props
 * @param {array} props.chainNodes - 思维链节点列表
 * @param {boolean} props.loading - 是否加载中
 */
export default function TaskThoughtChain({ chainNodes = [], loading = false }) {
  const items = useMemo(() => transformNodes(chainNodes), [chainNodes]);

  if (items.length === 0) {
    if (loading) {
      return (
        <Flex justify="center" style={{ padding: '16px 0' }}>
          <LoadingOutlined spin style={{ color: '#1890ff' }} />
        </Flex>
      );
    }
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无执行记录"
        style={{ padding: '12px 0' }}
      />
    );
  }

  return (
    <ThoughtChain
      items={items}
      line="dashed"
      style={{ padding: '4px 0' }}
    />
  );
}

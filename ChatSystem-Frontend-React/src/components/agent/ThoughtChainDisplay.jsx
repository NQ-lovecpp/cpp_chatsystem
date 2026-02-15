/**
 * ThoughtChain 思维链显示组件
 * 
 * 使用 Ant Design X 的 ThoughtChain 组件展示 Agent 的思考过程
 */

import React, { useMemo } from 'react';
import { ThoughtChain, Think } from '@ant-design/x';
import { Card, Typography, Flex } from 'antd';
import {
    BulbOutlined,
    CodeOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    ExclamationCircleOutlined,
    ToolOutlined,
    SearchOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// 节点类型图标映射
const nodeTypeIcons = {
    reasoning: <BulbOutlined style={{ color: '#faad14' }} />,
    tool_call: <ToolOutlined style={{ color: '#1890ff' }} />,
    search: <SearchOutlined style={{ color: '#52c41a' }} />,
    file_operation: <FileTextOutlined style={{ color: '#722ed1' }} />,
    result: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
};

// 状态映射
const statusMapping = {
    running: 'pending',
    pending: 'pending',
    success: 'success',
    completed: 'success',
    error: 'error',
    failed: 'error',
};

/**
 * 将后端的 ThoughtChain 节点转换为 Ant Design X 的格式
 */
function transformNode(node) {
    const nodeType = node.node_type || 'reasoning';
    const status = statusMapping[node.status] || 'pending';
    
    // 根据节点类型选择图标
    let icon = nodeTypeIcons[nodeType] || <CodeOutlined />;
    if (status === 'pending') {
        icon = <LoadingOutlined spin style={{ color: '#1890ff' }} />;
    }
    
    return {
        key: node.chain_id,
        title: node.title || '处理中...',
        description: node.description || '',
        icon,
        status,
        collapsible: !!node.content,
        content: node.content ? (
            <Flex gap="small" vertical style={{ padding: '8px 0' }}>
                {nodeType === 'reasoning' ? (
                    <Think title="思考过程" status={status === 'pending' ? 'thinking' : 'done'}>
                        {node.content}
                    </Think>
                ) : (
                    <Text 
                        type="secondary" 
                        style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontSize: 12,
                            maxHeight: 200,
                            overflow: 'auto',
                            display: 'block',
                            padding: '8px 12px',
                            background: 'var(--color-surface)',
                            borderRadius: 6,
                        }}
                    >
                        {node.content}
                    </Text>
                )}
            </Flex>
        ) : undefined,
    };
}

/**
 * ThoughtChain 显示组件
 * 
 * @param {Object} props
 * @param {Array} props.nodes - 思维链节点数组
 * @param {boolean} props.compact - 是否使用紧凑模式
 * @param {string} props.style - 自定义样式
 */
export default function ThoughtChainDisplay({ nodes = [], compact = false, style }) {
    // 转换节点为 Ant Design X 格式
    const items = useMemo(() => {
        if (!nodes || nodes.length === 0) return [];
        
        // 按 sequence 排序
        const sortedNodes = [...nodes].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        return sortedNodes.map(transformNode);
    }, [nodes]);
    
    if (items.length === 0) {
        return null;
    }
    
    return (
        <Card 
            size="small" 
            style={{ 
                marginBottom: 12,
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                ...style,
            }}
            styles={{
                body: { padding: compact ? '8px 12px' : '12px 16px' }
            }}
        >
            <ThoughtChain 
                items={items} 
                line="dashed"
                size={compact ? 'small' : 'default'}
            />
        </Card>
    );
}

/**
 * 内联 ThoughtChain Item（用于消息中嵌入）
 */
export function InlineThoughtChainItem({ node }) {
    if (!node) return null;
    
    const status = statusMapping[node.status] || 'pending';
    const nodeType = node.node_type || 'reasoning';
    
    let icon = nodeTypeIcons[nodeType] || <CodeOutlined />;
    if (status === 'pending') {
        icon = <LoadingOutlined spin style={{ color: '#1890ff' }} />;
    }
    
    return (
        <ThoughtChain.Item
            variant="solid"
            status={status}
            icon={icon}
            title={node.title || '处理中...'}
            description={node.description || ''}
        />
    );
}

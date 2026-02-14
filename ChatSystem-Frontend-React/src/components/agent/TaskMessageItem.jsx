/**
 * 任务消息项 - 统一渲染单条任务消息
 * 根据 message.type 路由到 ToolCallCard、MessageBubble 或专用展示
 * 供 TaskDetailPanel、GlobalAgentChat 等复用
 */

import { Alert } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { MessageType } from '../../contexts/AgentContext';
import MessageBubble from './MessageBubble';
import ToolCallCard from './ToolCallCard';

export default function TaskMessageItem({ message, isLastAssistantAndStreaming = false }) {
    const isUser = message.type === MessageType.USER;
    const isError = message.type === MessageType.ERROR;
    const isReasoning = message.type === MessageType.REASONING;
    const isToolCall = message.type === MessageType.TOOL_CALL;

    if (isToolCall) {
        return (
            <ToolCallCard
                toolName={message.toolName}
                arguments={message.arguments}
                output={message.output}
                status={message.status || 'executing'}
                requiresApproval={message.requiresApproval}
            />
        );
    }

    if (isReasoning) {
        return (
            <div className="flex gap-2 mb-3 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <BulbOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                <span className="text-sm text-[var(--color-text-muted)] italic">
                    {message.content}
                </span>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                type="error"
                message={message.content}
                showIcon
                style={{ marginBottom: 12 }}
            />
        );
    }

    return (
        <MessageBubble
            message={{
                content: message.content || '',
                isError: false,
            }}
            isUser={isUser}
            isLoading={isLastAssistantAndStreaming && !message.content}
            streaming={isLastAssistantAndStreaming && !!message.streaming}
        />
    );
}

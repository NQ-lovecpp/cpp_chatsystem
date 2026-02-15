/**
 * 消息输入组件（Ant Design X 版本）
 * 
 * 使用 Sender 组件和 slotConfig 支持：
 * 1. @ 触发 Agent 选择
 * 2. 图片/文件上传
 * 3. 词槽配置
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Sender, XProvider } from '@ant-design/x';
import { message, Popover, Button, List, Avatar, Tooltip } from 'antd';
import { 
  PaperClipOutlined, 
  PictureOutlined, 
  RobotOutlined,
  SendOutlined 
} from '@ant-design/icons';

// 默认的 Agent 用户列表
const DEFAULT_AGENTS = [
  {
    user_id: 'agent-gpt-oss-120b',
    nickname: 'AI 助手 (GPT-OSS-120B)',
    description: '基于 OpenRouter GPT-OSS-120B 模型的智能助手',
    model: 'openai/gpt-oss-120b',
    provider: 'openrouter'
  },
  {
    user_id: 'agent-o4-mini',
    nickname: 'AI 助手 (O4-Mini)',
    description: '基于 OpenAI O4-Mini 模型的智能助手',
    model: 'o4-mini',
    provider: 'openai'
  },
];

/**
 * Agent 选择器 Popover
 */
function AgentSelectorPopover({ agents, onSelect, children, open, onOpenChange }) {
  return (
    <Popover
      content={
        <List
          style={{ width: 280 }}
          itemLayout="horizontal"
          dataSource={agents}
          renderItem={(agent) => (
            <List.Item 
              style={{ cursor: 'pointer', padding: '8px 12px' }}
              onClick={() => {
                onSelect(agent);
                onOpenChange(false);
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<RobotOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                }
                title={agent.nickname}
                description={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {agent.description}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      }
      title="选择 AI 助手"
      trigger="click"
      open={open}
      onOpenChange={onOpenChange}
      placement="topLeft"
    >
      {children}
    </Popover>
  );
}

export default function MessageInputAntd({ 
  onSend, 
  onSendImage, 
  onSendFile,
  onAgentMention,  // 当触发 @ Agent 时的回调
  sessionAgents = [], // 会话中的 Agent 列表
  disabled = false,
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const senderRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // 状态
  const [value, setValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 合并 Agent 列表
  const availableAgents = sessionAgents.length > 0 ? sessionAgents : DEFAULT_AGENTS;

  // 处理提交
  const handleSubmit = useCallback(async (text) => {
    if (!text?.trim()) return;
    
    setLoading(true);
    try {
      // 检查是否包含 @agent 触发
      const agentMention = selectedAgent;
      
      if (agentMention && onAgentMention) {
        // 触发 Agent
        await onAgentMention(text, agentMention);
      } else if (onSend) {
        // 普通消息
        await onSend(text);
      }
      
      // 清空输入
      senderRef.current?.clear?.();
      setValue('');
      setSelectedAgent(null);
    } catch (error) {
      messageApi.error('发送失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, onSend, onAgentMention, messageApi]);

  // 处理输入变化 - 检测 @ 符号
  const handleChange = useCallback((newValue, event, slotConfig, skill) => {
    setValue(newValue);
    
    // 检测 @ 符号触发 Agent 选择
    if (newValue.endsWith('@')) {
      setAgentPopoverOpen(true);
    }
  }, []);

  // 选择 Agent
  const handleAgentSelect = useCallback((agent) => {
    setSelectedAgent(agent);
    // 移除 @ 符号并添加 Agent 标签
    const newValue = value.endsWith('@') ? value.slice(0, -1) : value;
    setValue(newValue);
    
    // 使用 skill 来显示选中的 Agent
    // 或者在消息前添加 @昵称 
    setTimeout(() => {
      senderRef.current?.focus?.();
    }, 100);
  }, [value]);

  // 处理图片选择
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onSendImage) {
      if (!file.type.startsWith('image/')) {
        messageApi.error('请选择图片文件');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        messageApi.error('图片大小不能超过 5MB');
        return;
      }
      onSendImage(file);
    }
    e.target.value = '';
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      if (file.size > 50 * 1024 * 1024) {
        messageApi.error('文件大小不能超过 50MB');
        return;
      }
      onSendFile(file);
    }
    e.target.value = '';
  };

  // 构建 skill 配置（显示选中的 Agent）
  const skillConfig = selectedAgent ? {
    value: selectedAgent.user_id,
    title: selectedAgent.nickname,
    toolTip: {
      title: selectedAgent.description,
    },
    closable: {
      onClose: () => {
        setSelectedAgent(null);
      },
    },
  } : undefined;

  // 自定义操作按钮
  const actions = (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {/* @ Agent 按钮 */}
      <AgentSelectorPopover
        agents={availableAgents}
        onSelect={handleAgentSelect}
        open={agentPopoverOpen}
        onOpenChange={setAgentPopoverOpen}
      >
        <Tooltip title="@AI 助手">
          <Button 
            type="text" 
            size="small"
            icon={<RobotOutlined />}
            style={{ color: selectedAgent ? '#1890ff' : undefined }}
          />
        </Tooltip>
      </AgentSelectorPopover>
      
      {/* 图片按钮 */}
      <Tooltip title="发送图片">
        <Button 
          type="text" 
          size="small"
          icon={<PictureOutlined />}
          onClick={() => imageInputRef.current?.click()}
        />
      </Tooltip>
      
      {/* 文件按钮 */}
      <Tooltip title="发送文件">
        <Button 
          type="text" 
          size="small"
          icon={<PaperClipOutlined />}
          onClick={() => fileInputRef.current?.click()}
        />
      </Tooltip>
    </div>
  );

  return (
    <div className="px-3 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm shrink-0">
      {contextHolder}
      
      {/* 隐藏的文件选择器 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 选中 Agent 提示 */}
      {selectedAgent && (
        <div 
          style={{ 
            marginBottom: 8, 
            padding: '4px 12px', 
            background: '#f0f7ff', 
            borderRadius: 8,
            fontSize: 13,
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <RobotOutlined />
          <span>正在与 <strong>{selectedAgent.nickname}</strong> 对话</span>
          <Button 
            type="link" 
            size="small" 
            onClick={() => setSelectedAgent(null)}
            style={{ marginLeft: 'auto', padding: 0 }}
          >
            取消
          </Button>
        </div>
      )}

      <XProvider
        theme={{
          components: {
            Sender: {
              fontSize: 14,
            },
          },
        }}
      >
        <Sender
          ref={senderRef}
          value={value}
          onChange={handleChange}
          onSubmit={handleSubmit}
          skill={skillConfig}
          placeholder="输入消息，@ 可唤出 AI 助手"
          loading={loading}
          disabled={disabled}
          actions={actions}
          style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
          autoSize={{ minRows: 1, maxRows: 6 }}
        />
      </XProvider>
    </div>
  );
}

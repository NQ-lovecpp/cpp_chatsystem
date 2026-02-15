/**
 * 任务 Todo 列表组件
 * 
 * 显示任务的执行步骤和进度：
 * - 支持实时更新
 * - 状态可视化
 * - 进度条展示
 */

import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { Card, List, Progress, Tag, Typography, Flex, Badge, Empty } from 'antd';

const { Text } = Typography;

// 状态配置
const STATUS_CONFIG = {
  pending: {
    icon: <ClockCircleOutlined />,
    color: 'default',
    text: '待处理',
    badgeStatus: 'default'
  },
  in_progress: {
    icon: <LoadingOutlined spin />,
    color: 'processing',
    text: '进行中',
    badgeStatus: 'processing'
  },
  completed: {
    icon: <CheckCircleOutlined />,
    color: 'success',
    text: '已完成',
    badgeStatus: 'success'
  },
  cancelled: {
    icon: <CloseCircleOutlined />,
    color: 'error',
    text: '已取消',
    badgeStatus: 'error'
  }
};

/**
 * 单个 Todo 项
 */
function TodoItem({ todo, index }) {
  const statusConfig = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;
  
  return (
    <List.Item style={{ padding: '12px 0' }}>
      <Flex align="center" gap={12} style={{ width: '100%' }}>
        {/* 序号 */}
        <Badge 
          count={index + 1} 
          style={{ 
            backgroundColor: todo.status === 'completed' ? '#52c41a' : 
                            todo.status === 'in_progress' ? '#1890ff' : '#d9d9d9'
          }} 
        />
        
        {/* 内容 */}
        <Flex vertical flex={1}>
          <Text 
            style={{ 
              textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
              color: todo.status === 'completed' ? '#999' : 
                     todo.status === 'cancelled' ? '#ff4d4f' : undefined
            }}
          >
            {todo.content}
          </Text>
          {todo.updated_at && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              更新于 {new Date(todo.updated_at).toLocaleTimeString()}
            </Text>
          )}
        </Flex>
        
        {/* 状态标签 */}
        <Tag 
          icon={statusConfig.icon}
          color={statusConfig.color}
        >
          {statusConfig.text}
        </Tag>
      </Flex>
    </List.Item>
  );
}

/**
 * 任务 Todo 列表组件
 * 
 * @param {object} props
 * @param {string} props.taskId - 任务 ID
 * @param {array} props.todos - Todo 列表
 * @param {boolean} props.loading - 是否加载中
 * @param {string} props.title - 标题
 */
export default function TaskTodoList({
  taskId,
  todos = [],
  loading = false,
  title = '任务步骤'
}) {
  // 计算进度
  const progress = useMemo(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.status === 'completed').length;
    return Math.round((completed / todos.length) * 100);
  }, [todos]);

  // 状态统计
  const stats = useMemo(() => {
    return {
      total: todos.length,
      pending: todos.filter(t => t.status === 'pending').length,
      in_progress: todos.filter(t => t.status === 'in_progress').length,
      completed: todos.filter(t => t.status === 'completed').length,
      cancelled: todos.filter(t => t.status === 'cancelled').length,
    };
  }, [todos]);

  // 排序：in_progress > pending > completed > cancelled
  const sortedTodos = useMemo(() => {
    const priority = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 };
    return [...todos].sort((a, b) => {
      const pA = priority[a.status] ?? 99;
      const pB = priority[b.status] ?? 99;
      if (pA !== pB) return pA - pB;
      return (a.sequence || 0) - (b.sequence || 0);
    });
  }, [todos]);

  if (todos.length === 0 && !loading) {
    return null;
  }

  return (
    <Card 
      size="small"
      title={
        <Flex align="center" gap={8}>
          <OrderedListOutlined />
          <span>{title}</span>
          <Tag>{stats.completed}/{stats.total}</Tag>
        </Flex>
      }
      extra={
        <Progress 
          type="circle" 
          percent={progress} 
          size={32}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      }
      style={{ marginBottom: 16 }}
      loading={loading}
    >
      {/* 进度条 */}
      <Progress 
        percent={progress}
        status={progress === 100 ? 'success' : 'active'}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
        style={{ marginBottom: 12 }}
      />

      {/* 状态统计 */}
      <Flex gap={8} style={{ marginBottom: 12 }}>
        {stats.in_progress > 0 && (
          <Tag color="processing" icon={<LoadingOutlined spin />}>
            进行中: {stats.in_progress}
          </Tag>
        )}
        {stats.pending > 0 && (
          <Tag color="default" icon={<ClockCircleOutlined />}>
            待处理: {stats.pending}
          </Tag>
        )}
        {stats.completed > 0 && (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            已完成: {stats.completed}
          </Tag>
        )}
      </Flex>

      {/* Todo 列表 */}
      {sortedTodos.length > 0 ? (
        <List
          size="small"
          dataSource={sortedTodos}
          renderItem={(todo, index) => (
            <TodoItem todo={todo} index={index} />
          )}
        />
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无任务步骤"
        />
      )}
    </Card>
  );
}

/**
 * 简化版 Todo 列表（用于侧边栏）
 */
export function CompactTodoList({ todos = [], maxItems = 5 }) {
  const displayTodos = todos.slice(0, maxItems);
  const hasMore = todos.length > maxItems;
  
  // 计算进度
  const progress = useMemo(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.status === 'completed').length;
    return Math.round((completed / todos.length) * 100);
  }, [todos]);

  if (todos.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
        <Progress 
          percent={progress} 
          size="small" 
          style={{ flex: 1, marginBottom: 0 }}
          showInfo={false}
        />
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {todos.filter(t => t.status === 'completed').length}/{todos.length}
        </Text>
      </Flex>
      
      {displayTodos.map((todo, index) => {
        const statusConfig = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;
        return (
          <Flex 
            key={todo.todo_id || index}
            align="center" 
            gap={8}
            style={{ 
              padding: '4px 0',
              fontSize: 12,
              color: todo.status === 'completed' ? '#999' : undefined
            }}
          >
            <span style={{ color: statusConfig.color === 'success' ? '#52c41a' : 
                                   statusConfig.color === 'processing' ? '#1890ff' : '#d9d9d9' }}>
              {statusConfig.icon}
            </span>
            <Text 
              ellipsis 
              style={{ 
                flex: 1,
                textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
              }}
            >
              {todo.content}
            </Text>
          </Flex>
        );
      })}
      
      {hasMore && (
        <Text type="secondary" style={{ fontSize: 11 }}>
          还有 {todos.length - maxItems} 项...
        </Text>
      )}
    </div>
  );
}

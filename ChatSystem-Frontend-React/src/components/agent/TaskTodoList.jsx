/**
 * 任务 Checklist 组件
 *
 * 复选框样式展示 Todo 步骤：
 * - completed / skipped → 打勾 + 删除线
 * - running → 旋转加载图标
 * - idle / pending → 空白复选框
 */

import { useMemo } from 'react';
import {
  LoadingOutlined,
  CloseCircleFilled,
} from '@ant-design/icons';
import { Flex, Progress, Typography } from 'antd';

const { Text } = Typography;

// CompactChecklist 用的状态配置
const STATUS_CONFIG = {
  idle:      { icon: null,                                                                         textStyle: {} },
  pending:   { icon: null,                                                                         textStyle: {} },
  running:   { icon: <LoadingOutlined spin style={{ color: '#1890ff', fontSize: 12 }} />,         textStyle: { color: '#1890ff' } },
  completed: { icon: <CloseCircleFilled style={{ color: '#1677ff', fontSize: 12, display: 'none' }} />, textStyle: { textDecoration: 'line-through', color: 'var(--color-text-muted)' } },
  failed:    { icon: <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 12 }} />,            textStyle: { color: '#ff4d4f' } },
  skipped:   { icon: null,                                                                         textStyle: { textDecoration: 'line-through', color: 'var(--color-text-muted)' } },
};

/**
 * 单个 Checklist 项
 */
function ChecklistItem({ todo, index }) {
  const isCompleted = todo.status === 'completed' || todo.status === 'skipped';
  const isRunning = todo.status === 'running';
  const isFailed = todo.status === 'failed';

  return (
    <Flex
      align="center"
      gap={10}
      style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}
    >
      {/* 复选框 - 参考设计：方形 checkbox，完成为蓝色填充+白勾 */}
      <div style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isRunning ? (
          <LoadingOutlined spin style={{ color: '#1890ff', fontSize: 14 }} />
        ) : isCompleted ? (
          // 蓝色方形填充 + 白色勾
          <div style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            background: '#1677ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : isFailed ? (
          <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 14 }} />
        ) : (
          // 空心方框
          <div style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid #d9d9d9' }} />
        )}
      </div>

      {/* Todo 文本 */}
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: isCompleted
            ? 'var(--color-text-muted)'
            : isFailed
              ? '#ff4d4f'
              : isRunning
                ? '#1890ff'
                : 'var(--color-text)',
          textDecoration: isCompleted ? 'line-through' : 'none',
        }}
        ellipsis={{ tooltip: todo.text }}
      >
        {todo.text}
      </Text>
    </Flex>
  );
}

/**
 * Checklist 任务步骤组件
 *
 * @param {object} props
 * @param {array} props.todos - Todo 列表
 * @param {number} props.progress - 进度百分比 (0-100)
 * @param {boolean} props.showProgress - 是否显示进度条
 */
export default function TaskChecklist({ todos = [], progress = 0, showProgress = true }) {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === 'completed' || t.status === 'skipped').length;
    const running = todos.filter(t => t.status === 'running').length;
    return { total, completed, running };
  }, [todos]);

  if (todos.length === 0) return null;

  return (
    <div>
      {/* 进度条 */}
      {showProgress && stats.total > 0 && (
        <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
          <Progress
            percent={progress || Math.round(stats.completed / stats.total * 100)}
            size="small"
            status={stats.completed === stats.total ? 'success' : 'active'}
            style={{ flex: 1, marginBottom: 0 }}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
            {stats.completed}/{stats.total}
          </Text>
        </Flex>
      )}

      {/* Checklist 列表 */}
      <div>
        {todos.map((todo, index) => (
          <ChecklistItem
            key={todo.id || index}
            todo={todo}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 紧凑版 Checklist（用于任务卡片收起状态预览）
 */
export function CompactChecklist({ todos = [], maxItems = 3 }) {
  const displayTodos = todos.slice(0, maxItems);
  const hasMore = todos.length > maxItems;
  const completed = todos.filter(t => t.status === 'completed' || t.status === 'skipped').length;

  if (todos.length === 0) return null;

  return (
    <div>
      <Flex align="center" gap={6} style={{ marginBottom: 4 }}>
        <Progress
          percent={todos.length > 0 ? Math.round(completed / todos.length * 100) : 0}
          size="small"
          showInfo={false}
          style={{ flex: 1, marginBottom: 0 }}
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          {completed}/{todos.length}
        </Text>
      </Flex>
      {displayTodos.map((todo, index) => {
        const config = STATUS_CONFIG[todo.status] || STATUS_CONFIG.idle;
        return (
          <Flex key={todo.id || index} align="center" gap={6} style={{ padding: '2px 0' }}>
            <div style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {config.icon || (
                <div style={{ width: 12, height: 12, border: '1.5px solid var(--color-border)', borderRadius: 2 }} />
              )}
            </div>
            <Text
              ellipsis
              style={{ flex: 1, fontSize: 12, ...config.textStyle }}
            >
              {todo.text}
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

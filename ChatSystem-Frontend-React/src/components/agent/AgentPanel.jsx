/**
 * Agent 面板组件（兼容版）
 * 已迁移到 TaskDetailPanel + TaskSidebar 架构
 * 此组件保留为兼容入口，内部使用新组件
 */

import { useAgent } from '../../contexts/AgentContext';
import TaskDetailPanel from './TaskDetailPanel';
import TaskSidebar from './TaskSidebar';

export default function AgentPanel({ className = '' }) {
    const { selectedTask } = useAgent();

    return (
        <div className={`flex h-full bg-[var(--color-background)] ${className}`}>
            {/* 左侧：任务详情 */}
            <div className="flex-1 min-w-0 min-h-0">
                <TaskDetailPanel />
            </div>
            {/* 右侧：任务列表 */}
            <div className="w-80 border-l border-[var(--color-border)] hidden md:block shrink-0">
                <TaskSidebar className="h-full" />
            </div>
        </div>
    );
}

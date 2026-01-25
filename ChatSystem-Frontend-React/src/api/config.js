/**
 * 服务器配置管理
 * 开发模式使用 Vite 代理，生产模式直接访问后端
 */

const STORAGE_KEY = 'chat_server_config';

// 默认配置 - 使用用户部署的后端服务器
const DEFAULT_CONFIG = {
    httpHost: '117.72.15.209',
    httpPort: 9000,
    wsHost: '117.72.15.209',
    wsPort: 9001,
};

// 检测是否为开发模式
const isDev = import.meta.env?.DEV || window.location.hostname === 'localhost';

/**
 * 获取当前服务器配置
 */
export function getServerConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Failed to parse server config:', e);
    }
    return DEFAULT_CONFIG;
}

/**
 * 保存服务器配置
 */
export function saveServerConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * 获取 HTTP 基础 URL
 * 开发模式使用相对路径（通过 Vite 代理）
 * 生产模式直接访问后端
 */
export function getHttpBaseUrl() {
    if (isDev) {
        // 开发模式使用 Vite 代理，返回空字符串使用相对路径
        return '';
    }
    const config = getServerConfig();
    return `http://${config.httpHost}:${config.httpPort}`;
}

/**
 * 获取 WebSocket URL
 */
export function getWebSocketUrl() {
    if (isDev) {
        // 开发模式使用 Vite 代理
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/ws`;
    }
    const config = getServerConfig();
    return `ws://${config.wsHost}:${config.wsPort}`;
}

/**
 * 生成唯一请求 ID
 */
export function makeRequestId() {
    return 'R' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

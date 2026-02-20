/**
 * 服务器配置管理
 * 开发模式使用 Vite 代理，生产模式直接访问后端
 */

const STORAGE_KEY = 'chat_server_config';

// 构建时可通过 VITE_* 注入；生产部署时优先使用当前访问的 hostname，便于公网访问
const getDefaultHost = () => {
    const buildHost = import.meta.env?.VITE_HTTP_HOST;
    if (buildHost) return buildHost;
    const hn = typeof window !== 'undefined' ? window.location.hostname : '';
    return hn || '127.0.0.1';
};
const getDefaultHttpPort = () => import.meta.env?.VITE_HTTP_PORT || '9000';
const getDefaultWsPort = () => import.meta.env?.VITE_WS_PORT || '9001';

function buildDefaultConfig() {
    const host = getDefaultHost();
    const httpPort = getDefaultHttpPort();
    const wsPort = getDefaultWsPort();
    return { httpHost: host, httpPort, wsHost: host, wsPort };
}
const DEFAULT_CONFIG = buildDefaultConfig();

// 仅 Vite dev server (npm run dev) 才走代理，preview/production 直连后端
const isDev = !!import.meta.env?.DEV;

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

/**
 * 工具函数库 - shadcn/ui 风格
 */

/**
 * 合并 className，支持条件类名
 * @param  {...string} classes 
 * @returns {string}
 */
export function cn(...classes) {
    return classes
        .flat()
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * 生成唯一ID
 * @param {string} prefix 
 * @returns {string}
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 防抖函数
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * 节流函数
 * @param {Function} fn 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 格式化文件大小
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * 格式化时间
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatTime(timestamp) {
    if (!timestamp) return '';
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    return new Date(ms).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * 格式化日期
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatDate(timestamp) {
    if (!timestamp) return '';
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return formatTime(timestamp);
    }
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

import { UserError, } from '@openai/agents-core';
export const BACKGROUND_RESULT_SYMBOL = Symbol('backgroundResult');
export function backgroundResult(content) {
    return {
        [BACKGROUND_RESULT_SYMBOL]: true,
        content,
    };
}
export function isBackgroundResult(result) {
    return (typeof result === 'object' &&
        result !== null &&
        BACKGROUND_RESULT_SYMBOL in result);
}
export function isValidRealtimeTool(tool) {
    return (tool.type === 'function' ||
        (tool.type === 'hosted_tool' && tool.name === 'hosted_mcp'));
}
export function toRealtimeToolDefinition(tool) {
    if (tool.type === 'function') {
        return tool;
    }
    if (tool.type === 'hosted_tool' && tool.name === 'hosted_mcp') {
        const serverUrl = tool.providerData.server_url && tool.providerData.server_url.length > 0
            ? tool.providerData.server_url
            : undefined;
        return {
            type: 'mcp',
            server_label: tool.providerData.server_label,
            server_url: serverUrl,
            headers: tool.providerData.headers,
            allowed_tools: tool.providerData.allowed_tools,
            require_approval: tool.providerData.require_approval,
        };
    }
    throw new UserError(`Invalid tool type: ${tool}`);
}
//# sourceMappingURL=tool.mjs.map
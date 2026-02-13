"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKGROUND_RESULT_SYMBOL = void 0;
exports.backgroundResult = backgroundResult;
exports.isBackgroundResult = isBackgroundResult;
exports.isValidRealtimeTool = isValidRealtimeTool;
exports.toRealtimeToolDefinition = toRealtimeToolDefinition;
const agents_core_1 = require("@openai/agents-core");
exports.BACKGROUND_RESULT_SYMBOL = Symbol('backgroundResult');
function backgroundResult(content) {
    return {
        [exports.BACKGROUND_RESULT_SYMBOL]: true,
        content,
    };
}
function isBackgroundResult(result) {
    return (typeof result === 'object' &&
        result !== null &&
        exports.BACKGROUND_RESULT_SYMBOL in result);
}
function isValidRealtimeTool(tool) {
    return (tool.type === 'function' ||
        (tool.type === 'hosted_tool' && tool.name === 'hosted_mcp'));
}
function toRealtimeToolDefinition(tool) {
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
    throw new agents_core_1.UserError(`Invalid tool type: ${tool}`);
}
//# sourceMappingURL=tool.js.map
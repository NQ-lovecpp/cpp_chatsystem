"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToolChoice = convertToolChoice;
exports.extractAllAssistantContent = extractAllAssistantContent;
exports.extractAllUserContent = extractAllUserContent;
exports.itemsToMessages = itemsToMessages;
exports.toolToOpenAI = toolToOpenAI;
exports.convertHandoffTool = convertHandoffTool;
var agents_core_1 = require("@openai/agents-core");
function convertToolChoice(toolChoice) {
    if (toolChoice == undefined || toolChoice == null)
        return undefined;
    if (toolChoice === 'auto')
        return 'auto';
    if (toolChoice === 'required')
        return 'required';
    if (toolChoice === 'none')
        return 'none';
    return {
        type: 'function',
        function: { name: toolChoice },
    };
}
function extractAllAssistantContent(content) {
    if (typeof content === 'string') {
        return content;
    }
    var out = [];
    for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
        var c = content_1[_i];
        if (c.type === 'output_text') {
            out.push(__assign({ type: 'text', text: c.text }, c.providerData));
        }
        else if (c.type === 'refusal') {
            out.push(__assign({ type: 'refusal', refusal: c.refusal }, c.providerData));
        }
        else if (c.type === 'audio' || c.type === 'image') {
            // ignoring audio as it is handled on the assistant message level
            continue;
        }
        else {
            var exhaustive = c; // ensures that the type is exhaustive
            throw new Error("Unknown content: ".concat(JSON.stringify(exhaustive)));
        }
    }
    return out;
}
function extractAllUserContent(content) {
    var _a;
    if (typeof content === 'string') {
        return content;
    }
    var out = [];
    for (var _i = 0, content_2 = content; _i < content_2.length; _i++) {
        var c = content_2[_i];
        if (c.type === 'input_text') {
            out.push(__assign({ type: 'text', text: c.text }, c.providerData));
        }
        else if (c.type === 'input_image') {
            // The Chat Completions API only accepts image URLs. If we see a file reference we reject it
            // early so callers get an actionable error instead of a cryptic API response.
            var imageSource = typeof c.image === 'string'
                ? c.image
                : typeof c.imageUrl === 'string'
                    ? c.imageUrl
                    : undefined;
            if (!imageSource) {
                throw new Error("Only image URLs are supported for input_image: ".concat(JSON.stringify(c)));
            }
            var _b = c.providerData || {}, image_url = _b.image_url, rest = __rest(_b, ["image_url"]);
            out.push(__assign({ type: 'image_url', image_url: __assign({ url: imageSource }, image_url) }, rest));
        }
        else if (c.type === 'input_file') {
            // Chat Completions API supports file inputs via the "file" content part type.
            // See: https://platform.openai.com/docs/guides/pdf-files?api-mode=chat
            var file = {};
            if (typeof c.file === 'string') {
                var value = c.file.trim();
                if (value.startsWith('data:')) {
                    file.file_data = value;
                }
                else {
                    throw new agents_core_1.UserError("Chat Completions only supports data URLs for file input. If you're trying to pass an uploaded file's ID, use an object with the id property instead: ".concat(JSON.stringify(c)));
                }
            }
            else if (c.file && typeof c.file === 'object' && 'id' in c.file) {
                file.file_id = c.file.id;
            }
            else {
                throw new agents_core_1.UserError("File input requires a data URL or file ID: ".concat(JSON.stringify(c)));
            }
            // Handle filename from the content item or providerData
            if (c.filename) {
                file.filename = c.filename;
            }
            else if ((_a = c.providerData) === null || _a === void 0 ? void 0 : _a.filename) {
                file.filename = c.providerData.filename;
            }
            var _c = c.providerData || {}, _filename = _c.filename, rest = __rest(_c, ["filename"]);
            out.push(__assign({ type: 'file', file: file }, rest));
        }
        else if (c.type === 'audio') {
            var _d = c.providerData || {}, input_audio = _d.input_audio, rest = __rest(_d, ["input_audio"]);
            out.push(__assign({ type: 'input_audio', input_audio: __assign({ data: c.audio }, input_audio) }, rest));
        }
        else {
            var exhaustive = c; // ensures that the type is exhaustive
            throw new Error("Unknown content: ".concat(JSON.stringify(exhaustive)));
        }
    }
    return out;
}
function isMessageItem(item) {
    if (item.type === 'message') {
        return true;
    }
    if (typeof item.type === 'undefined' && typeof item.role === 'string') {
        return true;
    }
    return false;
}
function itemsToMessages(items) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (typeof items === 'string') {
        return [{ role: 'user', content: items }];
    }
    var result = [];
    var currentAssistantMsg = null;
    var flushAssistantMessage = function () {
        if (currentAssistantMsg) {
            if (!currentAssistantMsg.tool_calls ||
                currentAssistantMsg.tool_calls.length === 0) {
                delete currentAssistantMsg.tool_calls;
            }
            result.push(currentAssistantMsg);
            currentAssistantMsg = null;
        }
    };
    var ensureAssistantMessage = function () {
        if (!currentAssistantMsg) {
            currentAssistantMsg = {
                role: 'assistant',
                content: null,
                tool_calls: [],
            };
        }
        return currentAssistantMsg;
    };
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        if (isMessageItem(item)) {
            var content = item.content, role = item.role, providerData = item.providerData;
            flushAssistantMessage();
            if (role === 'assistant') {
                var assistant = __assign({ role: 'assistant', content: extractAllAssistantContent(content) }, providerData);
                if (Array.isArray(content)) {
                    var audio = content.find(function (c) { return c.type === 'audio'; });
                    if (audio) {
                        assistant.audio = __assign({ id: '' }, audio.providerData);
                    }
                }
                result.push(assistant);
            }
            else if (role === 'user') {
                result.push(__assign({ role: role, content: extractAllUserContent(content) }, providerData));
            }
            else if (role === 'system') {
                result.push(__assign({ role: 'system', content: content }, providerData));
            }
        }
        else if (item.type === 'reasoning') {
            var asst = ensureAssistantMessage();
            // @ts-expect-error - reasoning is not supported in the official Chat Completion API spec
            // this is handling third party providers that support reasoning
            asst.reasoning = (_b = (_a = item.rawContent) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text;
            continue;
        }
        else if (item.type === 'hosted_tool_call') {
            if (item.name === 'file_search_call') {
                var asst = ensureAssistantMessage();
                var toolCalls = (_c = asst.tool_calls) !== null && _c !== void 0 ? _c : [];
                var fileSearch = item;
                var _j = (_d = fileSearch.providerData) !== null && _d !== void 0 ? _d : {}, functionData = _j.function, rest = __rest(_j, ["function"]);
                var _k = functionData !== null && functionData !== void 0 ? functionData : {}, argumentData = _k.arguments, remainingFunctionData = __rest(_k, ["arguments"]);
                toolCalls.push(__assign({ id: fileSearch.id || '', type: 'function', function: __assign({ name: 'file_search_call', arguments: JSON.stringify(__assign({ queries: (_f = (_e = fileSearch.providerData) === null || _e === void 0 ? void 0 : _e.queries) !== null && _f !== void 0 ? _f : [], status: fileSearch.status }, argumentData)) }, remainingFunctionData) }, rest));
                asst.tool_calls = toolCalls;
                continue;
            }
            else {
                throw new agents_core_1.UserError('Hosted tool calls are not supported for chat completions. Got item: ' +
                    JSON.stringify(item));
            }
        }
        else if (item.type === 'computer_call' ||
            item.type === 'computer_call_result' ||
            item.type === 'shell_call' ||
            item.type === 'shell_call_output' ||
            item.type === 'apply_patch_call' ||
            item.type === 'apply_patch_call_output') {
            throw new agents_core_1.UserError('Computer use calls are not supported for chat completions. Got item: ' +
                JSON.stringify(item));
        }
        else if (item.type === 'function_call') {
            var asst = ensureAssistantMessage();
            var toolCalls = (_g = asst.tool_calls) !== null && _g !== void 0 ? _g : [];
            var funcCall = item;
            toolCalls.push({
                id: funcCall.callId,
                type: 'function',
                function: {
                    name: funcCall.name,
                    arguments: (_h = funcCall.arguments) !== null && _h !== void 0 ? _h : '{}',
                },
            });
            asst.tool_calls = toolCalls;
            Object.assign(asst, funcCall.providerData);
        }
        else if (item.type === 'function_call_result') {
            flushAssistantMessage();
            var funcOutput = item;
            var toolContent = normalizeFunctionCallOutputForChat(funcOutput.output);
            result.push(__assign({ role: 'tool', tool_call_id: funcOutput.callId, content: toolContent }, funcOutput.providerData));
        }
        else if (item.type === 'unknown') {
            result.push(__assign({}, item.providerData));
        }
        else if (item.type === 'compaction') {
            throw new agents_core_1.UserError('Compaction items are not supported for chat completions. Please use the Responses API when working with compaction.');
        }
        else {
            var exhaustive = item; // ensures that the type is exhaustive
            throw new Error("Unknown item type: ".concat(JSON.stringify(exhaustive)));
        }
    }
    flushAssistantMessage();
    return result;
}
function normalizeFunctionCallOutputForChat(output) {
    if (typeof output === 'string') {
        return output;
    }
    if (Array.isArray(output)) {
        var textOnly = output.every(function (item) { return item.type === 'input_text'; });
        if (!textOnly) {
            throw new agents_core_1.UserError('Only text tool outputs are supported for chat completions.');
        }
        return output.map(function (item) { return item.text; }).join('');
    }
    if (isRecord(output) &&
        output.type === 'text' &&
        typeof output.text === 'string') {
        return output.text;
    }
    throw new agents_core_1.UserError('Only text tool outputs are supported for chat completions. Got item: ' +
        JSON.stringify(output));
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function toolToOpenAI(tool) {
    if (tool.type === 'function') {
        return {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters: tool.parameters,
                strict: tool.strict,
            },
        };
    }
    throw new Error("Hosted tools are not supported with the ChatCompletions API. Got tool type: ".concat(tool.type, ", tool: ").concat(JSON.stringify(tool)));
}
function convertHandoffTool(handoff) {
    return {
        type: 'function',
        function: {
            name: handoff.toolName,
            description: handoff.toolDescription || '',
            parameters: handoff.inputJsonSchema,
        },
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAiSdkUiMessageStreamResponse = createAiSdkUiMessageStreamResponse;
const ai_1 = require("ai");
function resolveToolName(raw) {
    return typeof raw.name === 'string' ? raw.name : String(raw.type ?? 'tool');
}
function resolveToolCallId(raw, toolName) {
    return raw.callId || raw.id || `${toolName}-${createId('call')}`;
}
function resolveEventSource(source) {
    if (typeof source.toStream === 'function') {
        return source.toStream();
    }
    return source;
}
let idCounter = 0;
function createId(prefix) {
    const randomUUID = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : undefined;
    if (randomUUID) {
        return `${prefix}-${randomUUID}`;
    }
    idCounter += 1;
    return `${prefix}-${Date.now()}-${idCounter}`;
}
function parseJsonArgs(raw) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return { raw };
    }
}
function extractToolInput(item) {
    const raw = item.rawItem;
    const toolName = resolveToolName(raw);
    const toolCallId = resolveToolCallId(raw, toolName);
    if (raw.type === 'function_call' && typeof raw.arguments === 'string') {
        return {
            toolCallId,
            toolName,
            input: parseJsonArgs(raw.arguments),
        };
    }
    if (raw.type === 'hosted_tool_call') {
        const input = typeof raw.arguments === 'string' ? parseJsonArgs(raw.arguments) : {};
        return { toolCallId, toolName, input };
    }
    if (raw.type === 'computer_call') {
        return { toolCallId, toolName, input: raw.action };
    }
    if (raw.type === 'shell_call') {
        return { toolCallId, toolName, input: raw.action };
    }
    if (raw.type === 'apply_patch_call') {
        return { toolCallId, toolName, input: raw.operation };
    }
    return null;
}
function extractHostedToolOutput(item, toolCallId) {
    const raw = item.rawItem;
    if (raw.type !== 'hosted_tool_call') {
        return null;
    }
    if (raw.status !== 'completed' || typeof raw.output === 'undefined') {
        return null;
    }
    const toolName = resolveToolName(raw);
    const resolvedToolCallId = toolCallId ?? resolveToolCallId(raw, toolName);
    return { toolCallId: resolvedToolCallId, output: raw.output };
}
function extractToolOutput(item) {
    const raw = item.rawItem;
    const toolCallId = raw.callId || raw.id;
    if (!toolCallId) {
        return null;
    }
    const output = typeof item.output !== 'undefined' ? item.output : raw.output;
    return { toolCallId, output };
}
function extractReasoningText(item) {
    return item.rawItem.content
        .map((entry) => (entry.type === 'input_text' ? entry.text : ''))
        .join('');
}
async function* buildUiMessageStream(events) {
    let messageId = null;
    let stepOpen = false;
    let pendingStepClose = false;
    let responseHasText = false;
    let stepHasTextOutput = false;
    let textOpen = false;
    let currentTextId = '';
    const startedToolCalls = new Set();
    const emittedToolOutputs = new Set();
    const ensureMessageStart = function* () {
        if (!messageId) {
            messageId = createId('message');
            yield { type: 'start', messageId };
        }
    };
    const ensureStepStart = function* () {
        if (!stepOpen) {
            stepOpen = true;
            pendingStepClose = false;
            stepHasTextOutput = false;
            yield { type: 'start-step' };
        }
    };
    const finishStep = function* () {
        if (stepOpen) {
            stepOpen = false;
            pendingStepClose = false;
            yield { type: 'finish-step' };
        }
    };
    for await (const event of events) {
        if (event.type === 'raw_model_stream_event') {
            const data = event.data;
            if (data.type === 'response_started') {
                yield* ensureMessageStart();
                responseHasText = false;
                yield* ensureStepStart();
            }
            if (data.type === 'output_text_delta') {
                yield* ensureMessageStart();
                yield* ensureStepStart();
                responseHasText = true;
                stepHasTextOutput = true;
                if (!textOpen) {
                    currentTextId = createId('text');
                    textOpen = true;
                    yield { type: 'text-start', id: currentTextId };
                }
                yield {
                    type: 'text-delta',
                    id: currentTextId,
                    delta: data.delta,
                };
            }
            if (data.type === 'response_done') {
                if (textOpen) {
                    textOpen = false;
                    yield { type: 'text-end', id: currentTextId };
                }
                if (stepOpen) {
                    if (stepHasTextOutput) {
                        yield* finishStep();
                    }
                    else {
                        pendingStepClose = true;
                    }
                }
            }
        }
        if (event.type === 'run_item_stream_event') {
            if (event.name === 'message_output_created') {
                yield* ensureMessageStart();
                if (!responseHasText) {
                    if (!stepOpen) {
                        yield* ensureStepStart();
                    }
                    const item = event.item;
                    const content = item.content;
                    if (content) {
                        const textId = createId('text');
                        yield { type: 'text-start', id: textId };
                        yield { type: 'text-delta', id: textId, delta: content };
                        yield { type: 'text-end', id: textId };
                        stepHasTextOutput = true;
                        responseHasText = true;
                    }
                }
                if (pendingStepClose) {
                    yield* finishStep();
                }
            }
            if (event.name === 'tool_called') {
                yield* ensureMessageStart();
                const payload = extractToolInput(event.item);
                if (payload) {
                    if (!startedToolCalls.has(payload.toolCallId)) {
                        startedToolCalls.add(payload.toolCallId);
                        yield {
                            type: 'tool-input-start',
                            toolCallId: payload.toolCallId,
                            toolName: payload.toolName,
                            dynamic: true,
                        };
                    }
                    yield {
                        type: 'tool-input-available',
                        toolCallId: payload.toolCallId,
                        toolName: payload.toolName,
                        input: payload.input,
                        dynamic: true,
                    };
                }
                const hostedOutput = extractHostedToolOutput(event.item, payload?.toolCallId);
                if (hostedOutput && !emittedToolOutputs.has(hostedOutput.toolCallId)) {
                    emittedToolOutputs.add(hostedOutput.toolCallId);
                    yield {
                        type: 'tool-output-available',
                        toolCallId: hostedOutput.toolCallId,
                        output: hostedOutput.output,
                        dynamic: true,
                    };
                }
            }
            if (event.name === 'tool_output') {
                yield* ensureMessageStart();
                const payload = extractToolOutput(event.item);
                if (payload && !emittedToolOutputs.has(payload.toolCallId)) {
                    emittedToolOutputs.add(payload.toolCallId);
                    yield {
                        type: 'tool-output-available',
                        toolCallId: payload.toolCallId,
                        output: payload.output,
                        dynamic: true,
                    };
                }
            }
            if (event.name === 'tool_approval_requested') {
                yield* ensureMessageStart();
                const item = event.item;
                const raw = item.rawItem;
                const toolCallId = raw.callId ||
                    raw.id ||
                    `${item.toolName ?? 'tool'}-${createId('call')}`;
                const approvalId = raw.id || toolCallId;
                yield {
                    type: 'tool-approval-request',
                    toolCallId,
                    approvalId,
                };
            }
            if (event.name === 'reasoning_item_created') {
                yield* ensureMessageStart();
                const reasoningId = createId('reasoning');
                const reasoningText = extractReasoningText(event.item);
                if (reasoningText) {
                    yield { type: 'reasoning-start', id: reasoningId };
                    yield {
                        type: 'reasoning-delta',
                        id: reasoningId,
                        delta: reasoningText,
                    };
                    yield { type: 'reasoning-end', id: reasoningId };
                }
            }
        }
    }
    if (textOpen) {
        yield { type: 'text-end', id: currentTextId };
    }
    if (stepOpen) {
        yield* finishStep();
    }
    yield { type: 'finish', finishReason: 'stop' };
}
/**
 * Creates a UI message stream Response compatible with the AI SDK data stream protocol.
 */
function createAiSdkUiMessageStreamResponse(source, options = {}) {
    const events = resolveEventSource(source);
    const iterator = buildUiMessageStream(events)[Symbol.asyncIterator]();
    const stream = new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
                return;
            }
            controller.enqueue(value);
        },
        async cancel() {
            if (iterator.return) {
                await iterator.return();
            }
        },
    });
    return (0, ai_1.createUIMessageStreamResponse)({
        stream,
        status: options.status,
        statusText: options.statusText,
        headers: options.headers,
    });
}
//# sourceMappingURL=uiMessageStream.js.map
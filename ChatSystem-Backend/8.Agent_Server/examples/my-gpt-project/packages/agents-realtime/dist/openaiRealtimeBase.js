"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeBase = exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG = exports.DEFAULT_OPENAI_REALTIME_MODEL = void 0;
const agents_core_1 = require("@openai/agents-core");
const clientMessages_1 = require("./clientMessages.js");
const items_1 = require("./items.js");
const logger_1 = __importDefault(require("./logger.js"));
const openaiRealtimeEvents_1 = require("./openaiRealtimeEvents.js");
const utils_1 = require("./utils.js");
const utils_2 = require("@openai/agents-core/utils");
/**
 * The default model that is used during the connection if no model is provided.
 */
exports.DEFAULT_OPENAI_REALTIME_MODEL = 'gpt-realtime';
/**
 * The default session config that gets send over during session connection unless overridden
 * by the user.
 */
exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG = {
    outputModalities: ['audio'],
    audio: {
        input: {
            format: { type: 'audio/pcm', rate: 24000 },
            transcription: { model: 'gpt-4o-mini-transcribe' },
            turnDetection: { type: 'semantic_vad' },
            noiseReduction: null,
        },
        output: {
            format: { type: 'audio/pcm', rate: 24000 },
            speed: 1,
        },
    },
};
class OpenAIRealtimeBase extends utils_2.EventEmitterDelegate {
    #model;
    #apiKey;
    #tracingConfig = null;
    #rawSessionConfig = null;
    eventEmitter = new agents_core_1.RuntimeEventEmitter();
    constructor(options = {}) {
        super();
        this.#model = options.model ?? exports.DEFAULT_OPENAI_REALTIME_MODEL;
        this.#apiKey = options.apiKey;
    }
    /**
     * The current model that is being used by the transport layer.
     */
    get currentModel() {
        return this.#model;
    }
    /**
     * The current model that is being used by the transport layer.
     * **Note**: The model cannot be changed mid conversation.
     */
    set currentModel(model) {
        this.#model = model;
    }
    /**
     * Hook for subclasses to clean up transport-specific state when audio
     * playback finishes. Defaults to a no-op.
     */
    _afterAudioDoneEvent() {
        // Intentionally empty.
    }
    get _rawSessionConfig() {
        return this.#rawSessionConfig ?? null;
    }
    async _getApiKey(options) {
        const apiKey = options.apiKey ?? this.#apiKey;
        if (typeof apiKey === 'function') {
            return await apiKey();
        }
        return apiKey;
    }
    _onMessage(event) {
        const { data: parsed, isGeneric } = (0, openaiRealtimeEvents_1.parseRealtimeEvent)(event);
        if (parsed === null) {
            return;
        }
        this.emit('*', parsed);
        if (isGeneric) {
            return;
        }
        if (parsed.type === 'error') {
            this.emit('error', { type: 'error', error: parsed });
        }
        else {
            this.emit(parsed.type, parsed);
        }
        if (parsed.type === 'response.created') {
            this.emit('turn_started', {
                type: 'response_started',
                providerData: {
                    ...parsed,
                },
            });
            return;
        }
        if (parsed.type === 'session.updated') {
            this.#rawSessionConfig = parsed.session;
        }
        if (parsed.type === 'response.done') {
            const response = openaiRealtimeEvents_1.responseDoneEventSchema.safeParse(parsed);
            if (!response.success) {
                logger_1.default.error('Error parsing response done event', response.error);
                return;
            }
            const inputTokens = response.data.response.usage?.input_tokens ?? 0;
            const outputTokens = response.data.response.usage?.output_tokens ?? 0;
            const totalTokens = inputTokens + outputTokens;
            const usage = new agents_core_1.Usage({
                inputTokens,
                inputTokensDetails: response.data.response.usage?.input_token_details ?? {},
                outputTokens,
                outputTokensDetails: response.data.response.usage?.output_token_details ?? {},
                totalTokens,
            });
            this.emit('usage_update', usage);
            this.emit('turn_done', {
                type: 'response_done',
                response: {
                    id: response.data.response.id ?? '',
                    output: response.data.response.output ?? [],
                    usage: {
                        inputTokens,
                        inputTokensDetails: response.data.response.usage?.input_token_details ?? {},
                        outputTokens,
                        outputTokensDetails: response.data.response.usage?.output_token_details ?? {},
                        totalTokens,
                    },
                },
            });
            return;
        }
        if (parsed.type === 'response.output_audio.done') {
            this.emit('audio_done');
            this._afterAudioDoneEvent();
            return;
        }
        if (parsed.type === 'conversation.item.deleted') {
            this.emit('item_deleted', {
                itemId: parsed.item_id,
            });
            return;
        }
        if (parsed.type === 'conversation.item.input_audio_transcription.completed' ||
            parsed.type === 'conversation.item.truncated') {
            // right now rather than keeping track of partials and rebuilding the item we
            // will retrieve it instead which triggers the `conversation.item.retrieved` event below
            this.sendEvent({
                type: 'conversation.item.retrieve',
                item_id: parsed.item_id,
            });
            return;
        }
        if (parsed.type === 'conversation.item.input_audio_transcription.delta' ||
            parsed.type === 'response.output_text.delta' ||
            parsed.type === 'response.output_audio_transcript.delta' ||
            parsed.type === 'response.function_call_arguments.delta') {
            if (parsed.type === 'response.output_audio_transcript.delta') {
                this.emit('audio_transcript_delta', {
                    type: 'transcript_delta',
                    delta: parsed.delta,
                    itemId: parsed.item_id,
                    responseId: parsed.response_id,
                });
            }
            // no support for partial transcripts yet.
            return;
        }
        if (parsed.type === 'conversation.item.added' ||
            parsed.type === 'conversation.item.done' ||
            parsed.type === 'conversation.item.retrieved') {
            // Handle MCP list tools items (only act when done to ensure tools are present)
            if (parsed.item.type === 'mcp_list_tools' &&
                parsed.type === 'conversation.item.done') {
                const serverLabel = parsed.item.server_label ?? '';
                const tools = (parsed.item.tools ?? []);
                try {
                    this.emit('mcp_tools_listed', {
                        serverLabel,
                        tools,
                    });
                }
                catch (err) {
                    logger_1.default.error('Error emitting mcp_tools_listed', err, parsed.item);
                }
                // We do not add this item to history; it's a transport-level side-channel.
                return;
            }
            if (parsed.item.type === 'message') {
                const previousItemId = parsed.type === 'conversation.item.added' ||
                    parsed.type === 'conversation.item.done'
                    ? parsed.previous_item_id
                    : null;
                const item = items_1.realtimeMessageItemSchema.parse({
                    itemId: parsed.item.id,
                    previousItemId,
                    type: parsed.item.type,
                    role: parsed.item.role,
                    content: parsed.item.content,
                    status: parsed.item.status,
                });
                this.emit('item_update', item);
                return;
            }
            if (parsed.item.type === 'mcp_approval_request' &&
                parsed.type === 'conversation.item.done') {
                const item = parsed.item;
                const mcpApprovalRequest = items_1.realtimeMcpCallApprovalRequestItem.parse({
                    itemId: item.id,
                    type: item.type,
                    serverLabel: item.server_label,
                    name: item.name,
                    arguments: JSON.parse(item.arguments || '{}'),
                    approved: item.approved,
                });
                this.emit('item_update', mcpApprovalRequest);
                this.emit('mcp_approval_request', mcpApprovalRequest);
                return;
            }
            if (parsed.item.type === 'mcp_tool_call' ||
                parsed.item.type === 'mcp_call') {
                const status = parsed.type === 'conversation.item.done'
                    ? 'completed'
                    : 'in_progress';
                const mcpCall = items_1.realtimeMcpCallItem.parse({
                    itemId: parsed.item.id,
                    type: parsed.item.type,
                    status,
                    arguments: parsed.item.arguments,
                    name: parsed.item.name,
                    output: parsed.item.output,
                });
                this.emit('item_update', mcpCall);
                if (parsed.type === 'conversation.item.done') {
                    this.emit('mcp_tool_call_completed', mcpCall);
                }
                return;
            }
        }
        if (parsed.type === 'response.mcp_call.in_progress') {
            const item = parsed;
            this.sendEvent({
                type: 'conversation.item.retrieve',
                item_id: item.item_id,
            });
            return;
        }
        if (parsed.type === 'mcp_list_tools.in_progress') {
            const item = parsed;
            if (item.item_id) {
                this.sendEvent({
                    type: 'conversation.item.retrieve',
                    item_id: item.item_id,
                });
            }
            return;
        }
        if (parsed.type === 'response.output_item.done' ||
            parsed.type === 'response.output_item.added') {
            const item = parsed.item;
            if (item.type === 'function_call' && item.status === 'completed') {
                const toolCall = items_1.realtimeToolCallItem.parse({
                    itemId: item.id,
                    type: item.type,
                    status: 'in_progress', // we set it to in_progress for the UI as it will only be completed with the output
                    arguments: item.arguments,
                    name: item.name,
                    output: null,
                });
                this.emit('item_update', toolCall);
                this.emit('function_call', {
                    id: item.id,
                    type: 'function_call',
                    callId: item.call_id ?? '',
                    arguments: item.arguments ?? '',
                    name: item.name ?? '',
                });
                return;
            }
            if (item.type === 'mcp_tool_call' || item.type === 'mcp_call') {
                const mcpCall = items_1.realtimeMcpCallItem.parse({
                    itemId: item.id,
                    type: item.type,
                    status: parsed.type === 'response.output_item.done'
                        ? 'completed'
                        : 'in_progress', // we set it to in_progress for the UI as it will only be completed with the output
                    arguments: item.arguments,
                    name: item.name,
                    output: item.output,
                });
                this.emit('item_update', mcpCall);
                return;
            }
            if (item.type === 'message') {
                const realtimeItem = items_1.realtimeMessageItemSchema.parse({
                    itemId: parsed.item.id,
                    type: parsed.item.type,
                    role: parsed.item.role,
                    content: parsed.item.content,
                    status: parsed.type === 'response.output_item.done'
                        ? (item.status ?? 'completed')
                        : (item.status ?? 'in_progress'),
                });
                this.emit('item_update', realtimeItem);
                return;
            }
        }
    }
    _onError(error) {
        this.emit('error', {
            type: 'error',
            error,
        });
    }
    _onOpen() {
        this.emit('connected');
    }
    _onClose() {
        this.emit('disconnected');
    }
    /**
     * Send a message to the Realtime API. This will create a new item in the conversation and
     * trigger a response.
     *
     * @param message - The message to send.
     * @param otherEventData - Additional event data to send.
     */
    sendMessage(message, otherEventData, { triggerResponse = true } = {}) {
        const content = typeof message === 'string'
            ? [
                {
                    type: 'input_text',
                    text: message,
                },
            ]
            : message.content.map((content) => {
                if (content.type === 'input_image') {
                    return {
                        type: 'input_image',
                        image_url: content.image,
                        ...(content.providerData ?? {}),
                    };
                }
                return content;
            });
        this.sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content,
            },
            ...otherEventData,
        });
        if (triggerResponse) {
            this.sendEvent({
                type: 'response.create',
            });
        }
    }
    addImage(image, { triggerResponse = true } = {}) {
        this.sendMessage({
            type: 'message',
            role: 'user',
            content: [{ type: 'input_image', image }],
        }, {}, { triggerResponse });
    }
    _getMergedSessionConfig(config) {
        const newConfig = (0, clientMessages_1.toNewSessionConfig)(config);
        const noiseReductionOverride = newConfig.audio?.input?.noiseReduction;
        const transcriptionOverride = newConfig.audio?.input?.transcription;
        const turnDetectionOverride = OpenAIRealtimeBase.buildTurnDetectionConfig(newConfig.audio?.input?.turnDetection);
        const sessionData = {
            type: 'realtime',
            instructions: newConfig.instructions,
            model: newConfig.model ?? this.#model,
            output_modalities: newConfig.outputModalities ??
                exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.outputModalities,
            audio: {
                input: {
                    format: newConfig.audio?.input?.format ??
                        exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.input?.format,
                    noise_reduction: noiseReductionOverride === undefined
                        ? exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.input
                            ?.noiseReduction
                        : noiseReductionOverride,
                    transcription: transcriptionOverride === undefined
                        ? exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.input
                            ?.transcription
                        : transcriptionOverride,
                    turn_detection: turnDetectionOverride === undefined
                        ? exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.input
                            ?.turnDetection
                        : turnDetectionOverride,
                },
                output: {
                    format: newConfig.audio?.output?.format ??
                        exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.output?.format,
                    voice: newConfig.audio?.output?.voice ??
                        exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.output?.voice,
                    speed: newConfig.audio?.output?.speed ??
                        exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.audio?.output?.speed,
                },
            },
            tool_choice: newConfig.toolChoice ??
                exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG.toolChoice,
            // We don't set tracing here to make sure that we don't try to override it on every
            // session.update as it might lead to errors
            ...(newConfig.providerData ?? {}),
        };
        if (newConfig.prompt) {
            sessionData.prompt = {
                id: newConfig.prompt.promptId,
                version: newConfig.prompt.version,
                variables: newConfig.prompt.variables,
            };
        }
        if (newConfig.tools && newConfig.tools.length > 0) {
            sessionData.tools = newConfig.tools.map((tool) => {
                const pickDefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => typeof value !== 'undefined'));
                if (tool.type === 'mcp') {
                    // Realtime API MCP tool shape: session.update properties and MCP tool headers
                    return pickDefined({
                        type: 'mcp',
                        server_label: tool.server_label,
                        server_url: tool.server_url,
                        server_description: tool.server_description,
                        connector_id: tool.connector_id,
                        authorization: tool.authorization,
                        headers: tool.headers,
                        allowed_tools: tool.allowed_tools,
                        require_approval: tool.require_approval,
                    });
                }
                // Realtime API function tool shape: keep only documented fields for session.update.
                return pickDefined({
                    type: tool.type,
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                });
            });
        }
        return sessionData;
    }
    /**
     * Build the payload object expected by the Realtime API when creating or updating a session.
     *
     * The helper centralises the conversion from camelCase runtime config to the snake_case payload
     * required by the Realtime API so transports that need a one-off payload (for example SIP call
     * acceptance) can reuse the same logic without duplicating private state.
     *
     * @param config - The session config to merge with defaults.
     */
    buildSessionPayload(config) {
        return this._getMergedSessionConfig(config);
    }
    static buildTurnDetectionConfig(c) {
        if (typeof c === 'undefined') {
            return undefined;
        }
        if (c === null) {
            return null;
        }
        const { type, createResponse, create_response, eagerness, interruptResponse, interrupt_response, prefixPaddingMs, prefix_padding_ms, silenceDurationMs, silence_duration_ms, threshold, idleTimeoutMs, idle_timeout_ms, ...rest } = c;
        const config = {
            type,
            create_response: createResponse ?? create_response,
            eagerness,
            interrupt_response: interruptResponse ?? interrupt_response,
            prefix_padding_ms: prefixPaddingMs ?? prefix_padding_ms,
            silence_duration_ms: silenceDurationMs ?? silence_duration_ms,
            idle_timeout_ms: idleTimeoutMs ?? idle_timeout_ms,
            threshold,
            ...rest,
        };
        // Remove undefined values from the config
        Object.keys(config).forEach((key) => {
            if (config[key] === undefined)
                delete config[key];
        });
        return Object.keys(config).length > 0 ? config : undefined;
    }
    /**
     * Sets the internal tracing config. This is used to track the tracing config that has been set
     * during the session.create event.
     */
    set _tracingConfig(tracingConfig) {
        this.#tracingConfig = tracingConfig;
    }
    /**
     * Sets the tracing config for the session. This will send the tracing config to the Realtime API.
     *
     * @param tracingConfig - The tracing config to set. We don't support 'auto' here as the SDK will always configure a Workflow Name unless it exists
     */
    _updateTracingConfig(tracingConfig) {
        if (typeof this.#tracingConfig === 'undefined') {
            // treating it as default value
            this.#tracingConfig = null;
        }
        if (tracingConfig === 'auto') {
            // turn on tracing in auto mode
            this.sendEvent({
                type: 'session.update',
                session: {
                    type: 'realtime',
                    tracing: 'auto',
                },
            });
            return;
        }
        if (this.#tracingConfig !== null &&
            typeof this.#tracingConfig !== 'string' &&
            typeof tracingConfig !== 'string') {
            // tracing is already set, we can't change it
            logger_1.default.warn('Tracing config is already set, skipping setting it again. This likely happens when you already set a tracing config on session creation.');
            return;
        }
        if (tracingConfig === null) {
            logger_1.default.debug('Disabling tracing for this session. It cannot be turned on for this session from this point on.');
            this.sendEvent({
                type: 'session.update',
                session: {
                    type: 'realtime',
                    tracing: null,
                },
            });
            return;
        }
        if (this.#tracingConfig === null ||
            typeof this.#tracingConfig === 'string') {
            // tracing is currently not set so we can set it to the new value
            this.sendEvent({
                type: 'session.update',
                session: {
                    type: 'realtime',
                    tracing: tracingConfig,
                },
            });
            return;
        }
        if (tracingConfig?.group_id !== this.#tracingConfig?.group_id ||
            tracingConfig?.metadata !== this.#tracingConfig?.metadata ||
            tracingConfig?.workflow_name !== this.#tracingConfig?.workflow_name) {
            logger_1.default.warn('Mismatch in tracing config. Ignoring the new tracing config. This likely happens when you already set a tracing config on session creation. Current tracing config: %s, new tracing config: %s', JSON.stringify(this.#tracingConfig), JSON.stringify(tracingConfig));
            return;
        }
        this.sendEvent({
            type: 'session.update',
            session: {
                type: 'realtime',
                tracing: tracingConfig,
            },
        });
    }
    /**
     * Updates the session config. This will merge it with the current session config with the default
     * values and send it to the Realtime API.
     *
     * @param config - The session config to update.
     */
    updateSessionConfig(config) {
        const sessionData = this.buildSessionPayload(config);
        this.sendEvent({
            type: 'session.update',
            session: sessionData,
        });
    }
    /**
     * Send the output of a function call to the Realtime API.
     *
     * @param toolCall - The tool call to send the output for.
     * @param output - The output of the function call.
     * @param startResponse - Whether to start a new response after sending the output.
     */
    sendFunctionCallOutput(toolCall, output, startResponse = true) {
        this.sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                output,
                call_id: toolCall.callId,
            },
        });
        try {
            const item = items_1.realtimeToolCallItem.parse({
                itemId: toolCall.id,
                previousItemId: toolCall.previousItemId,
                type: 'function_call',
                status: 'completed',
                arguments: toolCall.arguments,
                name: toolCall.name,
                output,
            });
            this.emit('item_update', item);
        }
        catch (error) {
            logger_1.default.error('Error parsing tool call item', error, toolCall);
        }
        if (startResponse) {
            this.sendEvent({
                type: 'response.create',
            });
        }
    }
    /**
     * Send an audio buffer to the Realtime API. If `{ commit: true }` is passed, the audio buffer
     * will be committed and the model will start processing it. This is necessary if you have
     * disabled turn detection / voice activity detection (VAD).
     *
     * @param audio - The audio buffer to send.
     * @param options - The options for the audio buffer.
     */
    sendAudio(audio, { commit = false } = {}) {
        this.sendEvent({
            type: 'input_audio_buffer.append',
            audio: (0, utils_1.arrayBufferToBase64)(audio),
        });
        if (commit) {
            this.sendEvent({
                type: 'input_audio_buffer.commit',
            });
        }
    }
    /**
     * Reset the history of the conversation. This will create a diff between the old and new history
     * and send the necessary events to the Realtime API to update the history.
     *
     * @param oldHistory - The old history of the conversation.
     * @param newHistory - The new history of the conversation.
     */
    resetHistory(oldHistory, newHistory) {
        const { removals, additions, updates } = (0, utils_1.diffRealtimeHistory)(oldHistory, newHistory);
        const removalIds = new Set(removals.map((item) => item.itemId));
        // we don't have an update event for items so we will remove and re-add what's there
        for (const update of updates) {
            removalIds.add(update.itemId);
        }
        if (removalIds.size > 0) {
            for (const itemId of removalIds) {
                this.sendEvent({
                    type: 'conversation.item.delete',
                    item_id: itemId,
                });
            }
        }
        const additionsAndUpdates = [...additions, ...updates];
        for (const addition of additionsAndUpdates) {
            if (addition.type === 'message') {
                const itemEntry = {
                    type: 'message',
                    role: addition.role,
                    content: addition.content,
                    id: addition.itemId,
                };
                if (addition.role !== 'system' && addition.status) {
                    itemEntry.status = addition.status;
                }
                this.sendEvent({
                    type: 'conversation.item.create',
                    item: itemEntry,
                });
            }
            else if (addition.type === 'function_call') {
                logger_1.default.warn('Function calls cannot be manually added or updated at the moment. Ignoring.');
            }
        }
    }
    sendMcpResponse(approvalRequest, approved) {
        this.sendEvent({
            type: 'conversation.item.create',
            previous_item_id: approvalRequest.itemId,
            item: {
                type: 'mcp_approval_response',
                approval_request_id: approvalRequest.itemId,
                approve: approved,
            },
        });
    }
}
exports.OpenAIRealtimeBase = OpenAIRealtimeBase;
//# sourceMappingURL=openaiRealtimeBase.js.map
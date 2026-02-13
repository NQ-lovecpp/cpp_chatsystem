import { createGenerationSpan, resetCurrentSpan, setCurrentSpan, Usage, UserError, withGenerationSpan, getLogger, } from '@openai/agents';
import { isZodObject } from '@openai/agents/utils';
import { encodeUint8ArrayToBase64 } from '@openai/agents/utils';
function getSpecVersion(model) {
    const spec = model?.specificationVersion;
    if (!spec) {
        // Default to v2 for backward compatibility with older AI SDK model wrappers.
        return 'v2';
    }
    if (spec === 'v2') {
        return 'v2';
    }
    if (typeof spec === 'string' && spec.toLowerCase().startsWith('v3')) {
        return 'v3';
    }
    return 'unknown';
}
function ensureSupportedModel(model) {
    const spec = getSpecVersion(model);
    if (spec === 'unknown') {
        throw new UserError(`Unsupported AI SDK specificationVersion: ${String(model?.specificationVersion)}. Only v2 and v3 are supported.`);
    }
}
/**
 * @internal
 * Converts a list of model items to a list of language model V2 messages.
 *
 * @param model - The model to use.
 * @param items - The items to convert.
 * @returns The list of language model V2 messages.
 */
export function itemsToLanguageV2Messages(model, items, modelSettings) {
    const messages = [];
    let currentAssistantMessage;
    let pendingReasonerReasoning;
    const flushPendingReasonerReasoningToMessages = () => {
        if (!(shouldIncludeReasoningContent(model, modelSettings) &&
            pendingReasonerReasoning)) {
            return;
        }
        const reasoningPart = {
            type: 'reasoning',
            text: pendingReasonerReasoning.text,
            providerOptions: pendingReasonerReasoning.providerOptions,
        };
        if (currentAssistantMessage &&
            Array.isArray(currentAssistantMessage.content) &&
            currentAssistantMessage.role === 'assistant') {
            currentAssistantMessage.content.unshift(reasoningPart);
            currentAssistantMessage.providerOptions = {
                ...pendingReasonerReasoning.providerOptions,
                ...currentAssistantMessage.providerOptions,
            };
        }
        else {
            messages.push({
                role: 'assistant',
                content: [reasoningPart],
                providerOptions: pendingReasonerReasoning.providerOptions,
            });
        }
        pendingReasonerReasoning = undefined;
    };
    for (const item of items) {
        if (item.type === 'message' || typeof item.type === 'undefined') {
            const { role, content, providerData } = item;
            if (role === 'system') {
                flushPendingReasonerReasoningToMessages();
                messages.push({
                    role: 'system',
                    content: content,
                    providerOptions: toProviderOptions(providerData, model),
                });
                continue;
            }
            if (role === 'user') {
                flushPendingReasonerReasoningToMessages();
                messages.push({
                    role,
                    content: typeof content === 'string'
                        ? [{ type: 'text', text: content }]
                        : content.map((c) => {
                            const { providerData: contentProviderData } = c;
                            if (c.type === 'input_text') {
                                return {
                                    type: 'text',
                                    text: c.text,
                                    providerOptions: toProviderOptions(contentProviderData, model),
                                };
                            }
                            if (c.type === 'input_image') {
                                const imageSource = typeof c.image === 'string'
                                    ? c.image
                                    : typeof c.imageUrl === 'string'
                                        ? c.imageUrl
                                        : undefined;
                                if (!imageSource) {
                                    throw new UserError('Only image URLs are supported for user inputs.');
                                }
                                const url = new URL(imageSource);
                                return {
                                    type: 'file',
                                    data: url,
                                    mediaType: 'image/*',
                                    providerOptions: toProviderOptions(contentProviderData, model),
                                };
                            }
                            if (c.type === 'input_file') {
                                throw new UserError('File inputs are not supported.');
                            }
                            throw new UserError(`Unknown content type: ${c.type}`);
                        }),
                    providerOptions: toProviderOptions(providerData, model),
                });
                continue;
            }
            if (role === 'assistant') {
                if (currentAssistantMessage) {
                    messages.push(currentAssistantMessage);
                    currentAssistantMessage = undefined;
                }
                const assistantProviderOptions = toProviderOptions(providerData, model);
                const assistantContent = content
                    .filter((c) => c.type === 'output_text')
                    .map((c) => {
                    const { providerData: contentProviderData } = c;
                    return {
                        type: 'text',
                        text: c.text,
                        providerOptions: toProviderOptions(contentProviderData, model),
                    };
                });
                if (shouldIncludeReasoningContent(model, modelSettings) &&
                    pendingReasonerReasoning) {
                    assistantContent.unshift({
                        type: 'reasoning',
                        text: pendingReasonerReasoning.text,
                        providerOptions: pendingReasonerReasoning.providerOptions,
                    });
                    messages.push({
                        role,
                        content: assistantContent,
                        providerOptions: {
                            ...pendingReasonerReasoning.providerOptions,
                            ...assistantProviderOptions,
                        },
                    });
                    pendingReasonerReasoning = undefined;
                    continue;
                }
                messages.push({
                    role,
                    content: assistantContent,
                    providerOptions: assistantProviderOptions,
                });
                continue;
            }
            const exhaustiveMessageTypeCheck = item;
            throw new Error(`Unknown message type: ${exhaustiveMessageTypeCheck}`);
        }
        else if (item.type === 'function_call') {
            if (!currentAssistantMessage) {
                currentAssistantMessage = {
                    role: 'assistant',
                    content: [],
                    providerOptions: toProviderOptions(item.providerData, model),
                };
            }
            if (Array.isArray(currentAssistantMessage.content) &&
                currentAssistantMessage.role === 'assistant') {
                // Reasoner models (e.g., DeepSeek Reasoner) require reasoning_content on tool-call messages.
                if (shouldIncludeReasoningContent(model, modelSettings) &&
                    pendingReasonerReasoning) {
                    currentAssistantMessage.content.push({
                        type: 'reasoning',
                        text: pendingReasonerReasoning.text,
                        providerOptions: pendingReasonerReasoning.providerOptions,
                    });
                    currentAssistantMessage.providerOptions = {
                        ...pendingReasonerReasoning.providerOptions,
                        ...currentAssistantMessage.providerOptions,
                    };
                    pendingReasonerReasoning = undefined;
                }
                const content = {
                    type: 'tool-call',
                    toolCallId: item.callId,
                    toolName: item.name,
                    input: parseArguments(item.arguments),
                    providerOptions: toProviderOptions(item.providerData, model),
                };
                currentAssistantMessage.content.push(content);
            }
            continue;
        }
        else if (item.type === 'function_call_result') {
            flushPendingReasonerReasoningToMessages();
            if (currentAssistantMessage) {
                messages.push(currentAssistantMessage);
                currentAssistantMessage = undefined;
            }
            const toolResult = {
                type: 'tool-result',
                toolCallId: item.callId,
                toolName: item.name,
                output: convertToAiSdkOutput(item.output),
                providerOptions: toProviderOptions(item.providerData, model),
            };
            messages.push({
                role: 'tool',
                content: [toolResult],
                providerOptions: toProviderOptions(item.providerData, model),
            });
            continue;
        }
        if (item.type === 'hosted_tool_call') {
            throw new UserError('Hosted tool calls are not supported');
        }
        if (item.type === 'computer_call') {
            throw new UserError('Computer calls are not supported');
        }
        if (item.type === 'computer_call_result') {
            throw new UserError('Computer call results are not supported');
        }
        if (item.type === 'shell_call') {
            throw new UserError('Shell calls are not supported');
        }
        if (item.type === 'shell_call_output') {
            throw new UserError('Shell call results are not supported');
        }
        if (item.type === 'apply_patch_call') {
            throw new UserError('Apply patch calls are not supported');
        }
        if (item.type === 'apply_patch_call_output') {
            throw new UserError('Apply patch call results are not supported');
        }
        if (item.type === 'reasoning' &&
            item.content.length > 0 &&
            typeof item.content[0].text === 'string') {
            // Only forward provider data when it targets this model so signatures stay scoped correctly.
            if (shouldIncludeReasoningContent(model, modelSettings)) {
                pendingReasonerReasoning = {
                    text: item.content[0].text,
                    providerOptions: toProviderOptions(item.providerData, model),
                };
                continue;
            }
            messages.push({
                role: 'assistant',
                content: [
                    {
                        type: 'reasoning',
                        text: item.content[0].text,
                        providerOptions: toProviderOptions(item.providerData, model),
                    },
                ],
                providerOptions: toProviderOptions(item.providerData, model),
            });
            continue;
        }
        if (item.type === 'unknown') {
            flushPendingReasonerReasoningToMessages();
            messages.push({ ...(item.providerData ?? {}) });
            continue;
        }
        if (item) {
            throw new UserError(`Unknown item type: ${item.type}`);
        }
        const itemType = item;
        throw new UserError(`Unknown item type: ${itemType}`);
    }
    flushPendingReasonerReasoningToMessages();
    if (currentAssistantMessage) {
        messages.push(currentAssistantMessage);
    }
    return messages;
}
/**
 * @internal
 * Converts a handoff to a language model V2 tool.
 *
 * @param model - The model to use.
 * @param handoff - The handoff to convert.
 */
function handoffToLanguageV2Tool(model, handoff) {
    return {
        type: 'function',
        name: handoff.toolName,
        description: handoff.toolDescription,
        inputSchema: handoff.inputJsonSchema,
    };
}
function convertToAiSdkOutput(output) {
    if (typeof output === 'string') {
        return { type: 'text', value: output };
    }
    if (Array.isArray(output)) {
        return convertStructuredOutputsToAiSdkOutput(output);
    }
    if (isRecord(output) && typeof output.type === 'string') {
        if (output.type === 'text' && typeof output.text === 'string') {
            return { type: 'text', value: output.text };
        }
        if (output.type === 'image' || output.type === 'file') {
            const structuredOutputs = convertLegacyToolOutputContent(output);
            return convertStructuredOutputsToAiSdkOutput(structuredOutputs);
        }
    }
    return { type: 'text', value: String(output) };
}
/**
 * Normalises legacy ToolOutput* objects into the protocol `input_*` shapes so that the AI SDK
 * bridge can treat all tool results uniformly.
 */
function convertLegacyToolOutputContent(output) {
    if (output.type === 'text') {
        const structured = {
            type: 'input_text',
            text: output.text,
        };
        if (output.providerData) {
            structured.providerData = output.providerData;
        }
        return [structured];
    }
    if (output.type === 'image') {
        const structured = { type: 'input_image' };
        if (output.detail) {
            structured.detail = output.detail;
        }
        if (typeof output.image === 'string' && output.image.length > 0) {
            structured.image = output.image;
        }
        else if (isRecord(output.image)) {
            const imageObj = output.image;
            const inlineMediaType = getImageInlineMediaType(imageObj);
            if (typeof imageObj.url === 'string' && imageObj.url.length > 0) {
                structured.image = imageObj.url;
            }
            else if (typeof imageObj.data === 'string' &&
                imageObj.data.length > 0) {
                structured.image = formatInlineData(imageObj.data, inlineMediaType);
            }
            else if (imageObj.data instanceof Uint8Array &&
                imageObj.data.length > 0) {
                structured.image = formatInlineData(imageObj.data, inlineMediaType);
            }
            else {
                const referencedId = (typeof imageObj.fileId === 'string' &&
                    imageObj.fileId.length > 0 &&
                    imageObj.fileId) ||
                    (typeof imageObj.id === 'string' && imageObj.id.length > 0
                        ? imageObj.id
                        : undefined);
                if (referencedId) {
                    structured.image = { id: referencedId };
                }
            }
        }
        if (output.providerData) {
            structured.providerData = output.providerData;
        }
        return [structured];
    }
    if (output.type === 'file') {
        return [];
    }
    throw new UserError(`Unsupported tool output type: ${JSON.stringify(output)}`);
}
function schemaAcceptsObject(schema) {
    if (!schema) {
        return false;
    }
    const schemaType = schema.type;
    if (Array.isArray(schemaType)) {
        if (schemaType.includes('object')) {
            return true;
        }
    }
    else if (schemaType === 'object') {
        return true;
    }
    return Boolean(schema.properties || schema.additionalProperties);
}
function expectsObjectArguments(tool) {
    if (!tool) {
        return false;
    }
    if ('toolName' in tool) {
        return schemaAcceptsObject(tool.inputJsonSchema);
    }
    if (tool.type === 'function') {
        return schemaAcceptsObject(tool.parameters);
    }
    return false;
}
/**
 * Maps the protocol-level structured outputs into the Language Model V2 result primitives.
 * The AI SDK expects either plain text or content parts (text + media), so we merge multiple
 * items accordingly.
 */
function convertStructuredOutputsToAiSdkOutput(outputs) {
    const textParts = [];
    const mediaParts = [];
    for (const item of outputs) {
        if (item.type === 'input_text') {
            textParts.push(item.text);
            continue;
        }
        if (item.type === 'input_image') {
            const imageValue = typeof item.image === 'string'
                ? item.image
                : isRecord(item.image) && typeof item.image.id === 'string'
                    ? `openai-file:${item.image.id}`
                    : typeof item.imageUrl === 'string'
                        ? item.imageUrl
                        : undefined;
            const legacyFileId = item.fileId;
            if (!imageValue && typeof legacyFileId === 'string') {
                textParts.push(`[image file_id=${legacyFileId}]`);
                continue;
            }
            if (!imageValue) {
                textParts.push('[image]');
                continue;
            }
            try {
                const url = new URL(imageValue);
                mediaParts.push({
                    type: 'media',
                    data: url.toString(),
                    mediaType: 'image/*',
                });
            }
            catch {
                textParts.push(imageValue);
            }
            continue;
        }
        if (item.type === 'input_file') {
            textParts.push('[file output skipped]');
            continue;
        }
    }
    if (mediaParts.length === 0) {
        return { type: 'text', value: textParts.join('') };
    }
    const value = [];
    if (textParts.length > 0) {
        value.push({ type: 'text', text: textParts.join('') });
    }
    value.push(...mediaParts);
    return { type: 'content', value };
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function getModelIdentifier(model) {
    return `${model.provider}:${model.modelId}`;
}
function isProviderDataForModel(providerData, model) {
    const providerDataModel = providerData.model;
    if (typeof providerDataModel !== 'string') {
        return true;
    }
    const target = getModelIdentifier(model).toLowerCase();
    const pdLower = providerDataModel.toLowerCase();
    return (pdLower === target ||
        pdLower === model.modelId.toLowerCase() ||
        pdLower === model.provider.toLowerCase());
}
function isGeminiModel(model) {
    const target = getModelIdentifier(model).toLowerCase();
    return (target.includes('gemini') || model.modelId.toLowerCase().includes('gemini'));
}
function isDeepSeekModel(model) {
    const target = getModelIdentifier(model).toLowerCase();
    return (target.includes('deepseek') ||
        model.modelId.toLowerCase().includes('deepseek') ||
        model.provider.toLowerCase().includes('deepseek'));
}
function shouldIncludeReasoningContent(model, modelSettings) {
    const target = getModelIdentifier(model).toLowerCase();
    const modelIdLower = model.modelId.toLowerCase();
    // DeepSeek models require reasoning_content to be sent alongside tool calls when
    // either the dedicated reasoner model is used or thinking mode is explicitly enabled.
    const isDeepSeekReasoner = target.includes('deepseek-reasoner') ||
        modelIdLower.includes('deepseek-reasoner');
    if (isDeepSeekReasoner) {
        return true;
    }
    if (!isDeepSeekModel(model)) {
        return false;
    }
    return hasEnabledDeepSeekThinking(modelSettings?.providerData);
}
function hasEnabledDeepSeekThinking(providerData) {
    if (!isRecord(providerData)) {
        return false;
    }
    const thinkingOption = [
        providerData.thinking,
        providerData.deepseek?.thinking,
        providerData.providerOptions?.thinking,
        providerData.providerOptions?.deepseek?.thinking,
    ].find((value) => value !== undefined);
    return isThinkingEnabled(thinkingOption);
}
function isThinkingEnabled(option) {
    if (option === undefined || option === null) {
        return false;
    }
    if (option === true) {
        return true;
    }
    if (typeof option === 'string') {
        return option.toLowerCase() === 'enabled';
    }
    if (isRecord(option)) {
        const type = option.type ?? option.mode ?? option.status;
        if (typeof type === 'string') {
            return type.toLowerCase() === 'enabled';
        }
    }
    return false;
}
function toProviderOptions(providerData, model) {
    if (!isRecord(providerData)) {
        return {};
    }
    if (!isProviderDataForModel(providerData, model)) {
        return {};
    }
    const options = { ...providerData };
    delete options.model;
    delete options.responseId;
    delete options.response_id;
    if (isGeminiModel(model)) {
        const googleFields = isRecord(options.google) ? { ...options.google } : {};
        const thoughtSignature = googleFields.thoughtSignature ??
            googleFields.thought_signature ??
            options.thoughtSignature ??
            options.thought_signature;
        if (thoughtSignature) {
            googleFields.thoughtSignature = thoughtSignature;
        }
        if (Object.keys(googleFields).length > 0) {
            options.google = googleFields;
        }
        delete options.thoughtSignature;
        delete options.thought_signature;
    }
    return options;
}
function buildBaseProviderData(model, responseId) {
    const base = { model: getModelIdentifier(model) };
    if (responseId) {
        base.responseId = responseId;
    }
    return base;
}
function mergeProviderData(base, ...sources) {
    const merged = {};
    if (isRecord(base)) {
        Object.assign(merged, base);
    }
    for (const src of sources) {
        if (isRecord(src)) {
            Object.assign(merged, src);
        }
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
}
function getImageInlineMediaType(source) {
    if (typeof source.mediaType === 'string' && source.mediaType.length > 0) {
        return source.mediaType;
    }
    return undefined;
}
function formatInlineData(data, mediaType) {
    const base64 = typeof data === 'string' ? data : encodeUint8ArrayToBase64(data);
    return mediaType ? `data:${mediaType};base64,${base64}` : base64;
}
/**
 * @internal
 * Converts a tool to a language model V2 tool.
 *
 * @param model - The model to use.
 * @param tool - The tool to convert.
 */
export function toolToLanguageV2Tool(model, tool) {
    if (tool.type === 'function') {
        return {
            type: 'function',
            name: tool.name,
            description: tool.description,
            inputSchema: tool.parameters,
        };
    }
    const providerToolType = getSpecVersion(model) === 'v3' ? 'provider' : 'provider-defined';
    const providerToolPrefix = getProviderToolPrefix(model);
    if (tool.type === 'hosted_tool') {
        return {
            type: providerToolType,
            id: `${providerToolPrefix}.${tool.name}`,
            name: tool.name,
            args: tool.providerData?.args ?? {},
        };
    }
    if (tool.type === 'computer') {
        return {
            type: providerToolType,
            id: `${providerToolPrefix}.${tool.name}`,
            name: tool.name,
            args: {
                environment: tool.environment,
                display_width: tool.dimensions[0],
                display_height: tool.dimensions[1],
            },
        };
    }
    throw new Error(`Unsupported tool type: ${JSON.stringify(tool)}`);
}
function getProviderToolPrefix(model) {
    if (getSpecVersion(model) !== 'v3') {
        return model.provider;
    }
    const providerLower = model.provider.toLowerCase();
    if (providerLower.startsWith('openai.')) {
        return 'openai';
    }
    return model.provider;
}
/**
 * @internal
 * Converts an output type to a language model V2 response format.
 *
 * @param outputType - The output type to convert.
 * @returns The language model V2 response format.
 */
export function getResponseFormat(outputType) {
    if (outputType === 'text') {
        return {
            type: 'text',
        };
    }
    return {
        type: 'json',
        name: outputType.name,
        schema: outputType.schema,
    };
}
/**
 * Wraps a model from the AI SDK that adheres to the LanguageModelV2 spec to be used used as a model
 * in the OpenAI Agents SDK to use other models.
 *
 * While you can use this with the OpenAI models, it is recommended to use the default OpenAI model
 * provider instead.
 *
 * If tracing is enabled, the model will send generation spans to your traces processor.
 *
 * ```ts
 * import { aisdk } from '@openai/agents-extensions';
 * import { openai } from '@ai-sdk/openai';
 *
 * const model = aisdk(openai('gpt-4o'));
 *
 * const agent = new Agent({
 *   name: 'My Agent',
 *   model
 * });
 * ```
 *
 * @param model - The Vercel AI SDK model to wrap.
 * @returns The wrapped model.
 */
export class AiSdkModel {
    #model;
    #logger = getLogger('openai-agents:extensions:ai-sdk');
    constructor(model) {
        ensureSupportedModel(model);
        this.#model = model;
    }
    async getResponse(request) {
        return withGenerationSpan(async (span) => {
            try {
                span.spanData.model = this.#model.provider + ':' + this.#model.modelId;
                span.spanData.model_config = {
                    provider: this.#model.provider,
                    model_impl: 'ai-sdk',
                };
                let input = typeof request.input === 'string'
                    ? [
                        {
                            role: 'user',
                            content: [{ type: 'text', text: request.input }],
                        },
                    ]
                    : itemsToLanguageV2Messages(this.#model, request.input, request.modelSettings);
                if (request.systemInstructions) {
                    input = [
                        {
                            role: 'system',
                            content: request.systemInstructions,
                        },
                        ...input,
                    ];
                }
                const tools = [
                    ...request.tools.map((tool) => toolToLanguageV2Tool(this.#model, tool)),
                    ...request.handoffs.map((handoff) => handoffToLanguageV2Tool(this.#model, handoff)),
                ];
                if (span && request.tracing === true) {
                    span.spanData.input = input;
                }
                if (isZodObject(request.outputType)) {
                    throw new UserError('Zod output type is not yet supported');
                }
                const responseFormat = getResponseFormat(request.outputType);
                const aiSdkRequest = {
                    ...(tools.length ? { tools } : {}),
                    toolChoice: toolChoiceToLanguageV2Format(request.modelSettings.toolChoice),
                    prompt: input,
                    temperature: request.modelSettings.temperature,
                    topP: request.modelSettings.topP,
                    frequencyPenalty: request.modelSettings.frequencyPenalty,
                    presencePenalty: request.modelSettings.presencePenalty,
                    maxOutputTokens: request.modelSettings.maxTokens,
                    responseFormat,
                    abortSignal: request.signal,
                    ...(request.modelSettings.providerData ?? {}),
                };
                if (this.#logger.dontLogModelData) {
                    this.#logger.debug('Request sent');
                }
                else {
                    this.#logger.debug('Request:', JSON.stringify(aiSdkRequest, null, 2));
                }
                const result = await this.#model.doGenerate(aiSdkRequest);
                const baseProviderData = buildBaseProviderData(this.#model, result.response?.id);
                const output = [];
                const resultContent = result.content ?? [];
                // Emit reasoning before tool calls so Anthropic thinking signatures propagate into the next turn.
                // Extract and add reasoning items FIRST (required by Anthropic: thinking blocks must precede tool_use blocks)
                const reasoningParts = resultContent.filter((c) => c && c.type === 'reasoning');
                for (const reasoningPart of reasoningParts) {
                    const reasoningText = typeof reasoningPart.text === 'string' ? reasoningPart.text : '';
                    output.push({
                        type: 'reasoning',
                        content: [{ type: 'input_text', text: reasoningText }],
                        rawContent: [{ type: 'reasoning_text', text: reasoningText }],
                        // Preserve provider-specific metadata (including signature for Anthropic extended thinking)
                        providerData: mergeProviderData(baseProviderData, reasoningPart.providerMetadata),
                    });
                }
                const toolCalls = resultContent.filter((c) => c && c.type === 'tool-call');
                const hasToolCalls = toolCalls.length > 0;
                const toolsNameToToolMap = new Map(request.tools.map((tool) => [tool.name, tool]));
                for (const handoff of request.handoffs) {
                    toolsNameToToolMap.set(handoff.toolName, handoff);
                }
                for (const toolCall of toolCalls) {
                    const requestedTool = typeof toolCall.toolName === 'string'
                        ? toolsNameToToolMap.get(toolCall.toolName)
                        : undefined;
                    if (!requestedTool && toolCall.toolName) {
                        this.#logger.warn(`Received tool call for unknown tool '${toolCall.toolName}'.`);
                    }
                    let toolCallArguments;
                    if (typeof toolCall.input === 'string') {
                        toolCallArguments =
                            toolCall.input === '' && expectsObjectArguments(requestedTool)
                                ? JSON.stringify({})
                                : toolCall.input;
                    }
                    else {
                        toolCallArguments = JSON.stringify(toolCall.input ?? {});
                    }
                    output.push({
                        type: 'function_call',
                        callId: toolCall.toolCallId,
                        name: toolCall.toolName,
                        arguments: toolCallArguments,
                        status: 'completed',
                        providerData: mergeProviderData(baseProviderData, toolCall.providerMetadata ??
                            (hasToolCalls ? result.providerMetadata : undefined)),
                    });
                }
                // Some of other platforms may return both tool calls and text.
                // Putting a text message here will let the agent loop to complete,
                // so adding this item only when the tool calls are empty.
                // Note that the same support is not available for streaming mode.
                if (!hasToolCalls) {
                    const textItem = resultContent.find((c) => c && c.type === 'text' && typeof c.text === 'string');
                    if (textItem) {
                        output.push({
                            type: 'message',
                            content: [{ type: 'output_text', text: textItem.text }],
                            role: 'assistant',
                            status: 'completed',
                            providerData: mergeProviderData(baseProviderData, result.providerMetadata),
                        });
                    }
                }
                if (span && request.tracing === true) {
                    span.spanData.output = output;
                }
                const response = {
                    responseId: result.response?.id ?? 'FAKE_ID',
                    usage: new Usage({
                        inputTokens: extractTokenCount(result.usage, 'inputTokens'),
                        outputTokens: extractTokenCount(result.usage, 'outputTokens'),
                        totalTokens: extractTokenCount(result.usage, 'inputTokens') +
                            extractTokenCount(result.usage, 'outputTokens') || 0,
                    }),
                    output,
                    providerData: result,
                };
                if (span && request.tracing === true) {
                    span.spanData.usage = {
                        // Note that tracing supports only input and output tokens for Chat Completions.
                        // So, we don't include other properties here.
                        input_tokens: response.usage.inputTokens,
                        output_tokens: response.usage.outputTokens,
                    };
                }
                if (this.#logger.dontLogModelData) {
                    this.#logger.debug('Response ready');
                }
                else {
                    this.#logger.debug('Response:', JSON.stringify(response, null, 2));
                }
                return response;
            }
            catch (error) {
                if (error instanceof Error) {
                    span.setError({
                        message: request.tracing === true ? error.message : 'Unknown error',
                        data: {
                            error: request.tracing === true
                                ? {
                                    name: error.name,
                                    message: error.message,
                                    // Include AI SDK specific error fields if they exist.
                                    ...(typeof error === 'object' && error !== null
                                        ? {
                                            ...('responseBody' in error
                                                ? { responseBody: error.responseBody }
                                                : {}),
                                            ...('responseHeaders' in error
                                                ? {
                                                    responseHeaders: error
                                                        .responseHeaders,
                                                }
                                                : {}),
                                            ...('statusCode' in error
                                                ? { statusCode: error.statusCode }
                                                : {}),
                                            ...('cause' in error
                                                ? { cause: error.cause }
                                                : {}),
                                        }
                                        : {}),
                                }
                                : error.name,
                        },
                    });
                }
                else {
                    span.setError({
                        message: 'Unknown error',
                        data: {
                            error: request.tracing === true ? String(error) : undefined,
                        },
                    });
                }
                throw error;
            }
        });
    }
    async *getStreamedResponse(request) {
        const span = request.tracing ? createGenerationSpan() : undefined;
        try {
            if (span) {
                span.start();
                setCurrentSpan(span);
            }
            if (span?.spanData) {
                span.spanData.model = this.#model.provider + ':' + this.#model.modelId;
                span.spanData.model_config = {
                    provider: this.#model.provider,
                    model_impl: 'ai-sdk',
                };
            }
            let input = typeof request.input === 'string'
                ? [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: request.input }],
                    },
                ]
                : itemsToLanguageV2Messages(this.#model, request.input, request.modelSettings);
            if (request.systemInstructions) {
                input = [
                    {
                        role: 'system',
                        content: request.systemInstructions,
                    },
                    ...input,
                ];
            }
            const tools = [
                ...request.tools.map((tool) => toolToLanguageV2Tool(this.#model, tool)),
                ...request.handoffs.map((handoff) => handoffToLanguageV2Tool(this.#model, handoff)),
            ];
            if (span && request.tracing === true) {
                span.spanData.input = input;
            }
            const responseFormat = getResponseFormat(request.outputType);
            const aiSdkRequest = {
                ...(tools.length ? { tools } : {}),
                toolChoice: toolChoiceToLanguageV2Format(request.modelSettings.toolChoice),
                prompt: input,
                temperature: request.modelSettings.temperature,
                topP: request.modelSettings.topP,
                frequencyPenalty: request.modelSettings.frequencyPenalty,
                presencePenalty: request.modelSettings.presencePenalty,
                maxOutputTokens: request.modelSettings.maxTokens,
                responseFormat,
                abortSignal: request.signal,
                ...(request.modelSettings.providerData ?? {}),
            };
            if (this.#logger.dontLogModelData) {
                this.#logger.debug('Request received (streamed)');
            }
            else {
                this.#logger.debug('Request (streamed):', JSON.stringify(aiSdkRequest, null, 2));
            }
            const { stream } = await this.#model.doStream(aiSdkRequest);
            const baseProviderData = buildBaseProviderData(this.#model);
            let started = false;
            let responseId;
            let usagePromptTokens = 0;
            let usageCompletionTokens = 0;
            const functionCalls = {};
            let textOutput;
            // State for tracking reasoning blocks (for Anthropic extended thinking):
            // Track reasoning deltas so we can preserve Anthropic signatures even when text is redacted.
            const reasoningBlocks = {};
            for await (const part of stream) {
                if (!started) {
                    started = true;
                    yield { type: 'response_started' };
                }
                yield { type: 'model', event: part };
                switch (part.type) {
                    case 'text-delta': {
                        if (!textOutput) {
                            textOutput = { type: 'output_text', text: '' };
                        }
                        textOutput.text += part.delta;
                        yield { type: 'output_text_delta', delta: part.delta };
                        break;
                    }
                    case 'reasoning-start': {
                        // Start tracking a new reasoning block
                        const reasoningId = part.id ?? 'default';
                        reasoningBlocks[reasoningId] = {
                            text: '',
                            providerMetadata: part.providerMetadata,
                        };
                        break;
                    }
                    case 'reasoning-delta': {
                        // Accumulate reasoning text
                        const reasoningId = part.id ?? 'default';
                        if (!reasoningBlocks[reasoningId]) {
                            reasoningBlocks[reasoningId] = {
                                text: '',
                                providerMetadata: part.providerMetadata,
                            };
                        }
                        reasoningBlocks[reasoningId].text += part.delta ?? '';
                        break;
                    }
                    case 'reasoning-end': {
                        // Capture final provider metadata (may contain signature)
                        const reasoningId = part.id ?? 'default';
                        if (reasoningBlocks[reasoningId] &&
                            part.providerMetadata) {
                            reasoningBlocks[reasoningId].providerMetadata = part.providerMetadata;
                        }
                        break;
                    }
                    case 'tool-call': {
                        const toolCallId = part.toolCallId;
                        if (toolCallId) {
                            functionCalls[toolCallId] = {
                                type: 'function_call',
                                callId: toolCallId,
                                name: part.toolName,
                                arguments: part.input ?? '',
                                status: 'completed',
                                providerData: mergeProviderData(baseProviderData, part.providerMetadata),
                            };
                        }
                        break;
                    }
                    case 'response-metadata': {
                        if (part.id) {
                            responseId = part.id;
                        }
                        break;
                    }
                    case 'finish': {
                        usagePromptTokens = extractTokenCount(part.usage, 'inputTokens');
                        usageCompletionTokens = extractTokenCount(part.usage, 'outputTokens');
                        break;
                    }
                    case 'error': {
                        throw part.error;
                    }
                    default:
                        break;
                }
            }
            const outputs = [];
            // Add reasoning items FIRST (required by Anthropic: thinking blocks must precede tool_use blocks)
            // Emit reasoning item even when text is empty to preserve signature in providerData for redacted thinking streams
            for (const [reasoningId, reasoningBlock] of Object.entries(reasoningBlocks)) {
                if (reasoningBlock.text || reasoningBlock.providerMetadata) {
                    outputs.push({
                        type: 'reasoning',
                        id: reasoningId !== 'default' ? reasoningId : undefined,
                        content: [{ type: 'input_text', text: reasoningBlock.text }],
                        rawContent: [{ type: 'reasoning_text', text: reasoningBlock.text }],
                        // Preserve provider-specific metadata (including signature for Anthropic extended thinking)
                        providerData: mergeProviderData(baseProviderData, reasoningBlock.providerMetadata, responseId ? { responseId } : undefined),
                    });
                }
            }
            if (textOutput) {
                outputs.push({
                    type: 'message',
                    role: 'assistant',
                    content: [textOutput],
                    status: 'completed',
                    providerData: mergeProviderData(baseProviderData, responseId ? { responseId } : undefined),
                });
            }
            for (const fc of Object.values(functionCalls)) {
                outputs.push({
                    ...fc,
                    providerData: mergeProviderData(baseProviderData, fc.providerData, responseId ? { responseId } : undefined),
                });
            }
            const finalEvent = {
                type: 'response_done',
                response: {
                    id: responseId ?? 'FAKE_ID',
                    usage: {
                        inputTokens: usagePromptTokens,
                        outputTokens: usageCompletionTokens,
                        totalTokens: usagePromptTokens + usageCompletionTokens,
                    },
                    output: outputs,
                },
            };
            if (span && request.tracing === true) {
                span.spanData.output = outputs;
                span.spanData.usage = {
                    // Note that tracing supports only input and output tokens for Chat Completions.
                    // So, we don't include other properties here.
                    input_tokens: finalEvent.response.usage.inputTokens,
                    output_tokens: finalEvent.response.usage.outputTokens,
                };
            }
            if (this.#logger.dontLogModelData) {
                this.#logger.debug('Response ready (streamed)');
            }
            else {
                this.#logger.debug('Response (streamed):', JSON.stringify(finalEvent.response, null, 2));
            }
            yield finalEvent;
        }
        catch (error) {
            if (span) {
                span.setError({
                    message: error instanceof Error ? error.message : 'Error streaming response',
                    data: {
                        error: request.tracing === true
                            ? error instanceof Error
                                ? {
                                    name: error.name,
                                    message: error.message,
                                    // Include AI SDK specific error fields if they exist.
                                    ...(typeof error === 'object' && error !== null
                                        ? {
                                            ...('responseBody' in error
                                                ? { responseBody: error.responseBody }
                                                : {}),
                                            ...('responseHeaders' in error
                                                ? {
                                                    responseHeaders: error
                                                        .responseHeaders,
                                                }
                                                : {}),
                                            ...('statusCode' in error
                                                ? { statusCode: error.statusCode }
                                                : {}),
                                            ...('cause' in error
                                                ? { cause: error.cause }
                                                : {}),
                                        }
                                        : {}),
                                }
                                : String(error)
                            : error instanceof Error
                                ? error.name
                                : undefined,
                    },
                });
            }
            throw error;
        }
        finally {
            if (span) {
                span.end();
                resetCurrentSpan();
            }
        }
    }
}
/**
 * Wraps a model from the AI SDK that adheres to the LanguageModelV2 spec to be used used as a model
 * in the OpenAI Agents SDK to use other models.
 *
 * While you can use this with the OpenAI models, it is recommended to use the default OpenAI model
 * provider instead.
 *
 * If tracing is enabled, the model will send generation spans to your traces processor.
 *
 * ```ts
 * import { aisdk } from '@openai/agents-extensions';
 * import { openai } from '@ai-sdk/openai';
 *
 * const model = aisdk(openai('gpt-4o'));
 *
 * const agent = new Agent({
 *   name: 'My Agent',
 *   model
 * });
 * ```
 *
 * @param model - The Vercel AI SDK model to wrap.
 * @returns The wrapped model.
 */
export function aisdk(model) {
    return new AiSdkModel(model);
}
function extractTokenCount(usage, key) {
    const val = usage?.[key];
    if (typeof val === 'number') {
        return Number.isNaN(val) ? 0 : val;
    }
    // Handle Google AI SDK object format ({ total: number, ... })
    if (typeof val === 'object' &&
        val !== null &&
        typeof val.total === 'number') {
        return val.total;
    }
    return 0;
}
export function parseArguments(args) {
    if (!args) {
        return {};
    }
    try {
        return JSON.parse(args);
    }
    catch (_) {
        return {};
    }
}
export function toolChoiceToLanguageV2Format(toolChoice) {
    if (!toolChoice) {
        return undefined;
    }
    switch (toolChoice) {
        case 'auto':
            return { type: 'auto' };
        case 'required':
            return { type: 'required' };
        case 'none':
            return { type: 'none' };
        default:
            return { type: 'tool', toolName: toolChoice };
    }
}
//# sourceMappingURL=index.mjs.map
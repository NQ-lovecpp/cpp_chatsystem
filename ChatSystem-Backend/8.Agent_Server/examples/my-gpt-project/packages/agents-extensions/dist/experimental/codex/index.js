"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codexTool = codexTool;
const agents_1 = require("@openai/agents");
const _shims_1 = require("@openai/agents-core/_shims");
const utils_1 = require("@openai/agents-core/utils");
const codex_sdk_1 = require("@openai/codex-sdk");
const zod_1 = require("zod");
const MAX_SPAN_TEXT_LENGTH = 2000;
const MAX_SPAN_LIST_ITEMS = 200;
const MAX_TODO_TEXT_LENGTH = 200;
const CodexToolInputTextSchema = zod_1.z
    .object({
    type: zod_1.z.literal('text'),
    text: zod_1.z
        .string()
        .trim()
        .min(1, 'Text inputs must include a non-empty "text" field.'),
})
    .strict();
const CodexToolInputImageSchema = zod_1.z
    .object({
    type: zod_1.z.literal('local_image'),
    path: zod_1.z
        .string()
        .trim()
        .min(1, 'Local image inputs must include a non-empty "path" field.'),
})
    .strict();
const CodexToolInputItemSchema = zod_1.z.union([
    CodexToolInputTextSchema,
    CodexToolInputImageSchema,
]);
const OutputSchemaStringSchema = zod_1.z
    .object({
    type: zod_1.z.literal('string'),
    description: zod_1.z.string().trim().optional(),
    enum: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).optional(),
})
    .strict();
const OutputSchemaNumberSchema = zod_1.z
    .object({
    type: zod_1.z.literal('number'),
    description: zod_1.z.string().trim().optional(),
    enum: zod_1.z.array(zod_1.z.number()).min(1).optional(),
})
    .strict();
const OutputSchemaIntegerSchema = zod_1.z
    .object({
    type: zod_1.z.literal('integer'),
    description: zod_1.z.string().trim().optional(),
    enum: zod_1.z.array(zod_1.z.number().int()).min(1).optional(),
})
    .strict();
const OutputSchemaBooleanSchema = zod_1.z
    .object({
    type: zod_1.z.literal('boolean'),
    description: zod_1.z.string().trim().optional(),
    enum: zod_1.z.array(zod_1.z.boolean()).min(1).optional(),
})
    .strict();
const OutputSchemaPrimitiveSchema = zod_1.z.union([
    OutputSchemaStringSchema,
    OutputSchemaNumberSchema,
    OutputSchemaIntegerSchema,
    OutputSchemaBooleanSchema,
]);
const OutputSchemaArraySchema = zod_1.z
    .object({
    type: zod_1.z.literal('array'),
    description: zod_1.z.string().trim().optional(),
    items: OutputSchemaPrimitiveSchema,
})
    .strict();
const OutputSchemaFieldSchema = zod_1.z.union([
    OutputSchemaPrimitiveSchema,
    OutputSchemaArraySchema,
]);
const OutputSchemaPropertyDescriptorSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1),
    description: zod_1.z.string().trim().optional(),
    schema: OutputSchemaFieldSchema,
})
    .strict();
const OutputSchemaDescriptorSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().optional(),
    description: zod_1.z.string().trim().optional(),
    properties: zod_1.z
        .array(OutputSchemaPropertyDescriptorSchema)
        .min(1)
        .describe('Property descriptors for the Codex response. Each property name must be unique.'),
    required: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
})
    .strict()
    .superRefine((descriptor, ctx) => {
    const seen = new Set();
    for (const property of descriptor.properties) {
        if (seen.has(property.name)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Duplicate property name "${property.name}" in output_schema.`,
                path: ['properties'],
            });
            break;
        }
        seen.add(property.name);
    }
    if (descriptor.required) {
        for (const name of descriptor.required) {
            if (!seen.has(name)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Required property "${name}" must also be defined in "properties".`,
                    path: ['required'],
                });
            }
        }
    }
});
const codexParametersSchema = zod_1.z
    .object({
    inputs: zod_1.z
        .array(CodexToolInputItemSchema)
        .min(1, 'Codex tool requires at least one input item.')
        .describe('Structured inputs appended to the Codex task. Provide at least one input item.'),
})
    .strict();
function resolveDefaultCodexApiKey(options) {
    if (options?.apiKey) {
        return options.apiKey;
    }
    const envOverride = options?.env;
    if (envOverride?.CODEX_API_KEY) {
        return envOverride.CODEX_API_KEY;
    }
    if (envOverride?.OPENAI_API_KEY) {
        return envOverride.OPENAI_API_KEY;
    }
    const env = (0, _shims_1.loadEnv)();
    return env.CODEX_API_KEY ?? env.OPENAI_API_KEY;
}
function resolveCodexOptions(options) {
    if (options?.apiKey) {
        return options;
    }
    const apiKey = resolveDefaultCodexApiKey(options);
    if (!apiKey) {
        return options;
    }
    if (!options) {
        return { apiKey };
    }
    return { ...options, apiKey };
}
function createCodexResolver(providedCodex, options) {
    if (providedCodex) {
        return async () => providedCodex;
    }
    let codexInstance = null;
    return async () => {
        if (!codexInstance) {
            codexInstance = new codex_sdk_1.Codex(options);
        }
        return codexInstance;
    };
}
const defaultParameters = codexParametersSchema;
/**
 * Wraps the Codex SDK in a function tool that can be consumed by the Agents SDK.
 *
 * The tool streams Codex events, creating child spans for reasoning items, command executions,
 * and MCP tool invocations. Those spans are nested under the Codex tool span automatically when
 * tracing is enabled.
 */
function codexTool(options = {}) {
    const { name = 'codex', description = 'Executes an agentic Codex task against the current workspace.', parameters = defaultParameters, codex: providedCodex, codexOptions, defaultThreadOptions, defaultTurnOptions, outputSchema: outputSchemaOption, threadId: defaultThreadId, sandboxMode, workingDirectory, skipGitRepoCheck, persistSession = false, onStream, } = options;
    const resolvedCodexOptions = resolveCodexOptions(codexOptions);
    const resolveCodex = createCodexResolver(providedCodex, resolvedCodexOptions);
    const validatedOutputSchema = resolveOutputSchema(outputSchemaOption);
    const resolvedThreadOptions = defaultThreadOptions ||
        sandboxMode ||
        workingDirectory ||
        typeof skipGitRepoCheck === 'boolean'
        ? {
            ...(defaultThreadOptions ?? {}),
            ...(sandboxMode ? { sandboxMode } : {}),
            ...(workingDirectory ? { workingDirectory } : {}),
            ...(typeof skipGitRepoCheck === 'boolean'
                ? { skipGitRepoCheck }
                : {}),
        }
        : undefined;
    let persistedThread = null;
    return (0, agents_1.tool)({
        name,
        description,
        parameters,
        strict: true,
        execute: async (input, runContext = new agents_1.RunContext(), details) => {
            const args = normalizeParameters(input);
            const codex = await resolveCodex();
            const thread = persistSession
                ? getOrCreatePersistedThread(codex, defaultThreadId, resolvedThreadOptions, persistedThread)
                : getThread(codex, defaultThreadId, resolvedThreadOptions);
            if (persistSession && !persistedThread) {
                persistedThread = thread;
            }
            const turnOptions = buildTurnOptions(defaultTurnOptions, validatedOutputSchema);
            const codexInput = buildCodexInput(args);
            const streamResult = await thread.runStreamed(codexInput, turnOptions);
            const { response, usage, threadId: streamedThreadId, } = await consumeEvents(streamResult, {
                args,
                onStream,
                toolCall: details?.toolCall,
            });
            const resolvedThreadId = thread.id ?? streamedThreadId;
            if (usage) {
                const inputTokensDetails = typeof usage.cached_input_tokens === 'number'
                    ? { cached_input_tokens: usage.cached_input_tokens }
                    : undefined;
                runContext.usage.add(new agents_1.Usage({
                    input_tokens: usage.input_tokens,
                    output_tokens: usage.output_tokens,
                    total_tokens: usage.input_tokens + usage.output_tokens,
                    input_tokens_details: inputTokensDetails,
                    requests: 1,
                }));
            }
            return {
                threadId: resolvedThreadId,
                response,
                usage,
            };
        },
        needsApproval: false,
        isEnabled: true,
    });
}
function resolveOutputSchema(option) {
    if (!option) {
        return undefined;
    }
    if ((0, utils_1.isZodObject)(option)) {
        const schema = zodJsonSchemaCompat(option);
        if (!schema) {
            throw new agents_1.UserError('Codex output schema must be a Zod object that can be converted to JSON Schema.');
        }
        return schema;
    }
    if (isJsonObjectSchema(option)) {
        if (option.additionalProperties !== false) {
            throw new agents_1.UserError('Codex output schema must set "additionalProperties" to false.');
        }
        return option;
    }
    const descriptor = OutputSchemaDescriptorSchema.parse(option);
    return buildCodexOutputSchema(descriptor);
}
function buildTurnOptions(defaults, outputSchema) {
    if (!defaults && !outputSchema) {
        return undefined;
    }
    return {
        ...(defaults ?? {}),
        ...(outputSchema ? { outputSchema } : {}),
    };
}
function normalizeParameters(params) {
    const inputs = params.inputs.map((item) => item.type === 'text'
        ? { type: 'text', text: item.text.trim() }
        : { type: 'local_image', path: item.path.trim() });
    return {
        inputs: inputs && inputs.length > 0 ? inputs : undefined,
    };
}
function buildCodexOutputSchema(descriptor) {
    const properties = Object.fromEntries(descriptor.properties.map((property) => {
        const schema = buildCodexOutputSchemaField(property.schema);
        if (property.description) {
            schema.description = property.description;
        }
        return [property.name, schema];
    }));
    const required = descriptor.required
        ? Array.from(new Set(descriptor.required))
        : undefined;
    const schema = {
        type: 'object',
        additionalProperties: false,
        properties,
    };
    if (required && required.length > 0) {
        schema.required = required;
    }
    if (descriptor.title) {
        schema.title = descriptor.title;
    }
    if (descriptor.description) {
        schema.description = descriptor.description;
    }
    return schema;
}
function buildCodexOutputSchemaField(field) {
    if (field.type === 'array') {
        const schema = {
            type: 'array',
            items: buildCodexOutputSchemaPrimitive(field.items),
        };
        if (field.description) {
            schema.description = field.description;
        }
        return schema;
    }
    return buildCodexOutputSchemaPrimitive(field);
}
function buildCodexOutputSchemaPrimitive(field) {
    const result = {
        type: field.type,
    };
    if (field.description) {
        result.description = field.description;
    }
    if (field.enum) {
        result.enum = field.enum;
    }
    return result;
}
function isJsonObjectSchema(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const record = value;
    return record.type === 'object';
}
const JSON_SCHEMA_DRAFT_07 = 'http://json-schema.org/draft-07/schema#';
const OPTIONAL_WRAPPERS = new Set(['optional']);
const DECORATOR_WRAPPERS = new Set([
    'brand',
    'branded',
    'catch',
    'default',
    'effects',
    'pipeline',
    'pipe',
    'prefault',
    'readonly',
    'refinement',
    'transform',
]);
const SIMPLE_TYPE_MAPPING = {
    string: { type: 'string' },
    number: { type: 'number' },
    bigint: { type: 'integer' },
    boolean: { type: 'boolean' },
    date: { type: 'string', format: 'date-time' },
};
function readZodDefinition(input) {
    if (typeof input !== 'object' || input === null) {
        return undefined;
    }
    const candidate = input;
    return candidate._zod?.def || candidate._def || candidate.def;
}
function readZodType(input) {
    const def = readZodDefinition(input);
    if (!def) {
        return undefined;
    }
    const rawType = (typeof def.typeName === 'string' && def.typeName) ||
        (typeof def.type === 'string' && def.type);
    if (typeof rawType !== 'string') {
        return undefined;
    }
    const lower = rawType.toLowerCase();
    return lower.startsWith('zod') ? lower.slice(3) : lower;
}
function zodJsonSchemaCompat(input) {
    const schema = buildObjectSchema(input);
    if (!schema) {
        return undefined;
    }
    if (!Array.isArray(schema.required)) {
        schema.required = [];
    }
    if (typeof schema.additionalProperties === 'undefined') {
        schema.additionalProperties = false;
    }
    if (typeof schema.$schema !== 'string') {
        schema.$schema = JSON_SCHEMA_DRAFT_07;
    }
    return schema;
}
function buildObjectSchema(value) {
    const shape = readShape(value);
    if (!shape) {
        return undefined;
    }
    const properties = {};
    const required = [];
    for (const [key, field] of Object.entries(shape)) {
        const { schema, optional } = convertProperty(field);
        if (!schema) {
            return undefined;
        }
        properties[key] = schema;
        if (!optional) {
            required.push(key);
        }
    }
    return { type: 'object', properties, required, additionalProperties: false };
}
function convertProperty(value) {
    let current = unwrapDecorators(value);
    let optional = false;
    while (OPTIONAL_WRAPPERS.has(readZodType(current) ?? '')) {
        optional = true;
        const def = readZodDefinition(current);
        const next = unwrapDecorators(def?.innerType);
        if (!next || next === current) {
            break;
        }
        current = next;
    }
    return { schema: convertSchema(current), optional };
}
function convertSchema(value) {
    if (value === undefined) {
        return undefined;
    }
    const unwrapped = unwrapDecorators(value);
    const type = readZodType(unwrapped);
    const def = readZodDefinition(unwrapped);
    if (!type) {
        return undefined;
    }
    if (type in SIMPLE_TYPE_MAPPING) {
        return SIMPLE_TYPE_MAPPING[type];
    }
    switch (type) {
        case 'object':
            return buildObjectSchema(unwrapped);
        case 'array':
            return buildArraySchema(def);
        case 'tuple':
            return buildTupleSchema(def);
        case 'union':
            return buildUnionSchema(def);
        case 'intersection':
            return buildIntersectionSchema(def);
        case 'literal':
            return buildLiteral(def);
        case 'enum':
        case 'nativeenum':
            return buildEnum(def);
        case 'record':
            return buildRecordSchema(def);
        case 'map':
            return buildMapSchema(def);
        case 'set':
            return buildSetSchema(def);
        case 'nullable':
            return buildNullableSchema(def);
        default:
            return undefined;
    }
}
function buildArraySchema(def) {
    const items = convertSchema(extractFirst(def, 'element', 'items', 'type'));
    return items ? { type: 'array', items } : undefined;
}
function buildTupleSchema(def) {
    const items = coerceArray(def?.items)
        .map((item) => convertSchema(item))
        .filter(Boolean);
    if (!items.length) {
        return undefined;
    }
    const schema = {
        type: 'array',
        items,
        minItems: items.length,
    };
    if (!def?.rest) {
        schema.maxItems = items.length;
    }
    return schema;
}
function buildUnionSchema(def) {
    const options = coerceArray(def?.options ?? def?.schemas)
        .map((option) => convertSchema(option))
        .filter(Boolean);
    return options.length ? { anyOf: options } : undefined;
}
function buildIntersectionSchema(def) {
    const left = convertSchema(def?.left);
    const right = convertSchema(def?.right);
    return left && right ? { allOf: [left, right] } : undefined;
}
function buildRecordSchema(def) {
    const valueSchema = convertSchema(def?.valueType ?? def?.values);
    return valueSchema
        ? { type: 'object', additionalProperties: valueSchema }
        : undefined;
}
function buildMapSchema(def) {
    const valueSchema = convertSchema(def?.valueType ?? def?.values);
    return valueSchema ? { type: 'array', items: valueSchema } : undefined;
}
function buildSetSchema(def) {
    const valueSchema = convertSchema(def?.valueType);
    return valueSchema
        ? { type: 'array', items: valueSchema, uniqueItems: true }
        : undefined;
}
function buildNullableSchema(def) {
    const inner = convertSchema(def?.innerType ?? def?.type);
    return inner ? { anyOf: [inner, { type: 'null' }] } : undefined;
}
function unwrapDecorators(value) {
    let current = value;
    while (DECORATOR_WRAPPERS.has(readZodType(current) ?? '')) {
        const def = readZodDefinition(current);
        const next = def?.innerType ??
            def?.schema ??
            def?.base ??
            def?.type ??
            def?.wrapped ??
            def?.underlying;
        if (!next || next === current) {
            return current;
        }
        current = next;
    }
    return current;
}
function extractFirst(def, ...keys) {
    if (!def) {
        return undefined;
    }
    for (const key of keys) {
        if (key in def && def[key] !== undefined) {
            return def[key];
        }
    }
    return undefined;
}
function coerceArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return value === undefined ? [] : [value];
}
function buildLiteral(def) {
    if (!def) {
        return undefined;
    }
    const literal = extractFirst(def, 'value', 'literal');
    if (literal === undefined) {
        return undefined;
    }
    return {
        const: literal,
        type: literal === null ? 'null' : typeof literal,
    };
}
function buildEnum(def) {
    if (!def) {
        return undefined;
    }
    if (Array.isArray(def.values)) {
        return { enum: def.values };
    }
    if (Array.isArray(def.options)) {
        return { enum: def.options };
    }
    if (def.values && typeof def.values === 'object') {
        return { enum: Object.values(def.values) };
    }
    if (def.enum && typeof def.enum === 'object') {
        return { enum: Object.values(def.enum) };
    }
    return undefined;
}
function readShape(input) {
    if (typeof input !== 'object' || input === null) {
        return undefined;
    }
    const candidate = input;
    if (candidate.shape && typeof candidate.shape === 'object') {
        return candidate.shape;
    }
    if (typeof candidate.shape === 'function') {
        try {
            return candidate.shape();
        }
        catch (_error) {
            return undefined;
        }
    }
    const def = readZodDefinition(candidate);
    const shape = def?.shape;
    if (shape && typeof shape === 'object') {
        return shape;
    }
    if (typeof shape === 'function') {
        try {
            return shape();
        }
        catch (_error) {
            return undefined;
        }
    }
    return undefined;
}
function getThread(codex, threadId, defaults) {
    if (threadId) {
        return codex.resumeThread(threadId, defaults);
    }
    return codex.startThread(defaults);
}
function getOrCreatePersistedThread(codex, threadId, threadOptions, existingThread) {
    if (existingThread) {
        if (threadId) {
            const existingId = existingThread.id;
            if (existingId && existingId !== threadId) {
                throw new agents_1.UserError('Codex tool is configured with persistSession=true and already has an active thread.');
            }
        }
        return existingThread;
    }
    return getThread(codex, threadId, threadOptions);
}
function buildCodexInput(args) {
    if (args.inputs && args.inputs.length > 0) {
        return args.inputs;
    }
    return '';
}
async function emitStreamEvent(handler, payload) {
    if (!handler) {
        return;
    }
    await Promise.allSettled([Promise.resolve().then(() => handler(payload))]);
}
async function consumeEvents({ events }, options) {
    const { args, onStream, toolCall } = options;
    const activeSpans = new Map();
    let finalResponse = '';
    let usage = null;
    let threadId = null;
    try {
        for await (const event of events) {
            if (event.type === 'thread.started') {
                threadId = event.thread_id;
            }
            await emitStreamEvent(onStream, {
                event,
                threadId,
                toolCall,
            });
            switch (event.type) {
                case 'item.started':
                    handleItemStarted(event.item, activeSpans);
                    break;
                case 'item.updated':
                    handleItemUpdated(event.item, activeSpans);
                    break;
                case 'item.completed':
                    handleItemCompleted(event.item, activeSpans);
                    if (event.item.type === 'agent_message' &&
                        typeof event.item.text === 'string') {
                        finalResponse = event.item.text;
                    }
                    break;
                case 'turn.completed':
                    usage = event.usage ?? null;
                    break;
                case 'turn.failed':
                    throw new agents_1.UserError(`Codex turn failed${event.error?.message ? `: ${event.error.message}` : ''}`);
                case 'error':
                    throw new agents_1.UserError(`Codex stream error: ${event.message}`);
                default:
                    // ignore other events
                    break;
            }
        }
    }
    finally {
        for (const span of activeSpans.values()) {
            span.end();
        }
        activeSpans.clear();
    }
    if (!finalResponse) {
        finalResponse = buildDefaultResponse(args);
    }
    return { response: finalResponse, usage, threadId };
}
function handleItemStarted(item, spans) {
    if (isCommandExecutionItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex command execution',
                data: buildCommandSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isFileChangeItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex file change',
                data: buildFileChangeSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isMcpToolCallItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: `Codex MCP tool call`,
                data: buildMcpToolSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isWebSearchItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex web search',
                data: buildWebSearchSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isTodoListItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex todo list',
                data: buildTodoListSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isErrorItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex error',
                data: buildErrorSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
        return;
    }
    if (isReasoningItem(item)) {
        const span = (0, agents_1.createCustomSpan)({
            data: {
                name: 'Codex reasoning',
                data: buildReasoningSpanData(item),
            },
        });
        span.start();
        spans.set(item.id, span);
    }
}
function handleItemUpdated(item, spans) {
    const span = item.id ? spans.get(item.id) : undefined;
    if (!span) {
        return;
    }
    if (isCommandExecutionItem(item)) {
        updateCommandSpan(span, item);
    }
    else if (isFileChangeItem(item)) {
        updateFileChangeSpan(span, item);
    }
    else if (isMcpToolCallItem(item)) {
        updateMcpToolSpan(span, item);
    }
    else if (isWebSearchItem(item)) {
        updateWebSearchSpan(span, item);
    }
    else if (isTodoListItem(item)) {
        updateTodoListSpan(span, item);
    }
    else if (isErrorItem(item)) {
        updateErrorSpan(span, item);
    }
    else if (isReasoningItem(item)) {
        updateReasoningSpan(span, item);
    }
}
function handleItemCompleted(item, spans) {
    const span = item.id ? spans.get(item.id) : undefined;
    if (!span) {
        return;
    }
    if (isCommandExecutionItem(item)) {
        updateCommandSpan(span, item);
        if (item.status === 'failed') {
            span.setError({
                message: 'Codex command execution failed.',
                data: {
                    exitCode: item.exit_code ?? null,
                    output: item.aggregated_output ?? '',
                },
            });
        }
    }
    else if (isFileChangeItem(item)) {
        updateFileChangeSpan(span, item);
        if (item.status === 'failed') {
            span.setError({
                message: 'Codex file change failed.',
                data: {
                    changes: item.changes,
                },
            });
        }
    }
    else if (isMcpToolCallItem(item)) {
        updateMcpToolSpan(span, item);
        if (item.status === 'failed' && item.error?.message) {
            span.setError({
                message: item.error.message,
            });
        }
    }
    else if (isWebSearchItem(item)) {
        updateWebSearchSpan(span, item);
    }
    else if (isTodoListItem(item)) {
        updateTodoListSpan(span, item);
    }
    else if (isErrorItem(item)) {
        updateErrorSpan(span, item);
        span.setError({
            message: item.message,
        });
    }
    else if (isReasoningItem(item)) {
        updateReasoningSpan(span, item);
    }
    span.end();
    spans.delete(item.id);
}
function updateCommandSpan(span, item) {
    replaceSpanData(span, buildCommandSpanData(item));
}
function updateFileChangeSpan(span, item) {
    replaceSpanData(span, buildFileChangeSpanData(item));
}
function updateMcpToolSpan(span, item) {
    replaceSpanData(span, buildMcpToolSpanData(item));
}
function updateWebSearchSpan(span, item) {
    replaceSpanData(span, buildWebSearchSpanData(item));
}
function updateTodoListSpan(span, item) {
    replaceSpanData(span, buildTodoListSpanData(item));
}
function updateErrorSpan(span, item) {
    replaceSpanData(span, buildErrorSpanData(item));
}
function updateReasoningSpan(span, item) {
    replaceSpanData(span, buildReasoningSpanData(item));
}
function buildDefaultResponse(args) {
    const inputSummary = args.inputs?.length ? 'with inputs.' : 'with no inputs.';
    return `Codex task completed ${inputSummary}`;
}
function replaceSpanData(span, next) {
    const data = span.spanData.data;
    for (const key of Object.keys(data)) {
        delete data[key];
    }
    Object.assign(data, next);
}
function buildCommandSpanData(item) {
    const data = {
        command: item.command,
        status: item.status,
        exitCode: item.exit_code ?? null,
    };
    const output = item.aggregated_output ?? '';
    applyTruncatedField(data, 'output', output, {
        maxLength: MAX_SPAN_TEXT_LENGTH,
        mode: 'tail',
    });
    return data;
}
function buildFileChangeSpanData(item) {
    const changes = item.changes.slice(0, MAX_SPAN_LIST_ITEMS).map((change) => ({
        path: change.path,
        kind: change.kind,
    }));
    const data = {
        changes,
        status: item.status,
    };
    if (item.changes.length > changes.length) {
        data.changes_truncated = true;
        data.changes_total = item.changes.length;
    }
    return data;
}
function buildMcpToolSpanData(item) {
    const data = {
        server: item.server,
        tool: item.tool,
        status: item.status,
    };
    if (typeof item.arguments !== 'undefined') {
        applyTruncatedField(data, 'arguments', (0, utils_1.toSmartString)(item.arguments), {
            maxLength: MAX_SPAN_TEXT_LENGTH,
            mode: 'head',
        });
    }
    if (item.result) {
        const resultSummary = {
            content_items: Array.isArray(item.result.content)
                ? item.result.content.length
                : 0,
        };
        if (typeof item.result.structured_content !== 'undefined') {
            applyTruncatedField(resultSummary, 'structured_content', (0, utils_1.toSmartString)(item.result.structured_content), { maxLength: MAX_SPAN_TEXT_LENGTH, mode: 'head' });
        }
        data.result = resultSummary;
    }
    if (item.error?.message) {
        applyTruncatedField(data, 'error', item.error.message, {
            maxLength: MAX_SPAN_TEXT_LENGTH,
            mode: 'head',
        });
    }
    return data;
}
function buildWebSearchSpanData(item) {
    const data = {};
    applyTruncatedField(data, 'query', item.query, {
        maxLength: MAX_SPAN_TEXT_LENGTH,
        mode: 'head',
    });
    return data;
}
function buildTodoListSpanData(item) {
    const items = item.items.slice(0, MAX_SPAN_LIST_ITEMS).map((entry) => {
        const result = { completed: entry.completed };
        applyTruncatedField(result, 'text', entry.text, {
            maxLength: MAX_TODO_TEXT_LENGTH,
            mode: 'head',
        });
        return result;
    });
    const data = { items };
    if (item.items.length > items.length) {
        data.items_truncated = true;
        data.items_total = item.items.length;
    }
    return data;
}
function buildErrorSpanData(item) {
    const data = {};
    applyTruncatedField(data, 'message', item.message, {
        maxLength: MAX_SPAN_TEXT_LENGTH,
        mode: 'head',
    });
    return data;
}
function buildReasoningSpanData(item) {
    const data = {};
    applyTruncatedField(data, 'text', item.text, {
        maxLength: MAX_SPAN_TEXT_LENGTH,
        mode: 'head',
    });
    return data;
}
function applyTruncatedField(target, field, value, options) {
    const { text, truncated, length } = truncateText(value, options);
    target[field] = text;
    if (truncated) {
        target[`${field}_truncated`] = true;
        target[`${field}_length`] = length;
    }
}
function truncateText(value, { maxLength, mode }) {
    if (value.length <= maxLength) {
        return { text: value, truncated: false, length: value.length };
    }
    if (mode === 'tail') {
        return {
            text: `…${value.slice(-maxLength)}`,
            truncated: true,
            length: value.length,
        };
    }
    return {
        text: `${value.slice(0, maxLength)}…`,
        truncated: true,
        length: value.length,
    };
}
function isCommandExecutionItem(item) {
    return item?.type === 'command_execution';
}
function isFileChangeItem(item) {
    return item?.type === 'file_change';
}
function isMcpToolCallItem(item) {
    return item?.type === 'mcp_tool_call';
}
function isWebSearchItem(item) {
    return item?.type === 'web_search';
}
function isTodoListItem(item) {
    return item?.type === 'todo_list';
}
function isErrorItem(item) {
    return item?.type === 'error';
}
function isReasoningItem(item) {
    return item?.type === 'reasoning';
}
//# sourceMappingURL=index.js.map
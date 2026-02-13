"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeMcpCallApprovalRequestItem = exports.realtimeMcpCallItem = exports.realtimeToolCallItem = exports.realtimeMessageItemSchema = exports.baseItemSchema = void 0;
const zod_1 = require("zod");
exports.baseItemSchema = zod_1.z.object({
    itemId: zod_1.z.string(),
});
exports.realtimeMessageItemSchema = zod_1.z.discriminatedUnion('role', [
    zod_1.z.object({
        itemId: zod_1.z.string(),
        previousItemId: zod_1.z.string().nullable().optional(),
        type: zod_1.z.literal('message'),
        role: zod_1.z.literal('system'),
        content: zod_1.z.array(zod_1.z.object({ type: zod_1.z.literal('input_text'), text: zod_1.z.string() })),
    }),
    zod_1.z.object({
        itemId: zod_1.z.string(),
        previousItemId: zod_1.z.string().nullable().optional(),
        type: zod_1.z.literal('message'),
        role: zod_1.z.literal('user'),
        status: zod_1.z.enum(['in_progress', 'completed']),
        content: zod_1.z.array(zod_1.z.object({ type: zod_1.z.literal('input_text'), text: zod_1.z.string() }).or(zod_1.z.object({
            type: zod_1.z.literal('input_audio'),
            audio: zod_1.z.string().nullable().optional(),
            transcript: zod_1.z.string().nullable(),
        }))),
    }),
    zod_1.z.object({
        itemId: zod_1.z.string(),
        previousItemId: zod_1.z.string().nullable().optional(),
        type: zod_1.z.literal('message'),
        role: zod_1.z.literal('assistant'),
        status: zod_1.z.enum(['in_progress', 'completed', 'incomplete']),
        content: zod_1.z.array(zod_1.z.object({ type: zod_1.z.literal('output_text'), text: zod_1.z.string() }).or(zod_1.z.object({
            type: zod_1.z.literal('output_audio'),
            audio: zod_1.z.string().nullable().optional(),
            transcript: zod_1.z.string().nullable().optional(),
        }))),
    }),
]);
exports.realtimeToolCallItem = zod_1.z.object({
    itemId: zod_1.z.string(),
    previousItemId: zod_1.z.string().nullable().optional(),
    type: zod_1.z.literal('function_call'),
    status: zod_1.z.enum(['in_progress', 'completed', 'incomplete']),
    arguments: zod_1.z.string(),
    name: zod_1.z.string(),
    output: zod_1.z.string().nullable(),
});
exports.realtimeMcpCallItem = zod_1.z.object({
    itemId: zod_1.z.string(),
    previousItemId: zod_1.z.string().nullable().optional(),
    type: zod_1.z.enum(['mcp_call', 'mcp_tool_call']),
    status: zod_1.z.enum(['in_progress', 'completed', 'incomplete']),
    arguments: zod_1.z.string(),
    name: zod_1.z.string(),
    output: zod_1.z.string().nullable(),
});
exports.realtimeMcpCallApprovalRequestItem = zod_1.z.object({
    itemId: zod_1.z.string(),
    type: zod_1.z.literal('mcp_approval_request'),
    serverLabel: zod_1.z.string(),
    name: zod_1.z.string(),
    arguments: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    approved: zod_1.z.boolean().optional().nullable(),
});
//# sourceMappingURL=items.js.map
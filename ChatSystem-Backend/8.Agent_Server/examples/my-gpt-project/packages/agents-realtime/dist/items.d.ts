import { z } from 'zod';
export declare const baseItemSchema: z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>;
export declare const realtimeMessageItemSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    itemId: z.ZodString;
    previousItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodLiteral<"message">;
    role: z.ZodLiteral<"system">;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"input_text">;
        text: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    previousItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodLiteral<"message">;
    role: z.ZodLiteral<"user">;
    status: z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
    }>;
    content: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"input_text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"input_audio">;
        audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        transcript: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>]>>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    previousItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodLiteral<"message">;
    role: z.ZodLiteral<"assistant">;
    status: z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        incomplete: "incomplete";
    }>;
    content: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"output_text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"output_audio">;
        audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>]>>;
}, z.core.$strip>], "role">;
export declare const realtimeToolCallItem: z.ZodObject<{
    itemId: z.ZodString;
    previousItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodLiteral<"function_call">;
    status: z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        incomplete: "incomplete";
    }>;
    arguments: z.ZodString;
    name: z.ZodString;
    output: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const realtimeMcpCallItem: z.ZodObject<{
    itemId: z.ZodString;
    previousItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodEnum<{
        mcp_call: "mcp_call";
        mcp_tool_call: "mcp_tool_call";
    }>;
    status: z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        incomplete: "incomplete";
    }>;
    arguments: z.ZodString;
    name: z.ZodString;
    output: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const realtimeMcpCallApprovalRequestItem: z.ZodObject<{
    itemId: z.ZodString;
    type: z.ZodLiteral<"mcp_approval_request">;
    serverLabel: z.ZodString;
    name: z.ZodString;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
    approved: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type RealtimeBaseItem = z.infer<typeof baseItemSchema>;
export type RealtimeMessageItem = z.infer<typeof realtimeMessageItemSchema>;
export type RealtimeToolCallItem = z.infer<typeof realtimeToolCallItem>;
export type RealtimeMcpCallItem = z.infer<typeof realtimeMcpCallItem>;
export type RealtimeMcpCallApprovalRequestItem = z.infer<typeof realtimeMcpCallApprovalRequestItem>;
export type RealtimeItem = RealtimeMessageItem | RealtimeToolCallItem | RealtimeMcpCallItem | RealtimeMcpCallApprovalRequestItem;

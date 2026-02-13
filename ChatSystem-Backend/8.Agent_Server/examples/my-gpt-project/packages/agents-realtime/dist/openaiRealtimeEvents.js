"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseMcpCallArgumentsDeltaEventSchema = exports.mcpListToolsCompletedEventSchema = exports.mcpListToolsInProgressEventSchema = exports.sessionUpdateEventSchema = exports.responseCreateEventSchema = exports.responseCancelEventSchema = exports.sessionUpdatedEventSchema = exports.sessionCreatedEventSchema = exports.responseTextDoneEventSchema = exports.responseTextDeltaEventSchema = exports.responseOutputItemDoneEventSchema = exports.responseOutputItemAddedEventSchema = exports.responseFunctionCallArgumentsDoneEventSchema = exports.responseFunctionCallArgumentsDeltaEventSchema = exports.responseDoneEventSchema = exports.responseCreatedEventSchema = exports.responseContentPartDoneEventSchema = exports.responseContentPartAddedEventSchema = exports.responseAudioTranscriptDoneEventSchema = exports.responseAudioTranscriptDeltaEventSchema = exports.responseAudioDoneEventSchema = exports.responseAudioDeltaEventSchema = exports.rateLimitsUpdatedEventSchema = exports.outputAudioBufferClearedEventSchema = exports.outputAudioBufferStoppedEventSchema = exports.outputAudioBufferStartedEventSchema = exports.inputAudioBufferSpeechStoppedEventSchema = exports.inputAudioBufferSpeechStartedEventSchema = exports.inputAudioBufferCommittedEventSchema = exports.inputAudioBufferCommitEventSchema = exports.inputAudioBufferClearEventSchema = exports.inputAudioBufferAppendEventSchema = exports.inputAudioBufferClearedEventSchema = exports.errorEventSchema = exports.conversationItemTruncateEventSchema = exports.conversationItemRetrieveEventSchema = exports.conversationItemDeleteEventSchema = exports.conversationItemCreateEventSchema = exports.conversationItemTruncatedEventSchema = exports.conversationItemRetrievedEventSchema = exports.conversationItemInputAudioTranscriptionFailedEventSchema = exports.conversationItemInputAudioTranscriptionDeltaEventSchema = exports.conversationItemInputAudioTranscriptionCompletedEventSchema = exports.conversationItemDeletedEventSchema = exports.conversationItemDoneEventSchema = exports.conversationItemAddedEventSchema = exports.conversationCreatedEventSchema = exports.conversationItemSchema = exports.conversationItemContentSchema = exports.realtimeResponse = void 0;
exports.realtimeClientEventSchema = exports.realtimeServerEventSchema = exports.genericEventSchema = exports.mcpListToolsFailedEventSchema = exports.responseMcpCallCompletedEventSchema = exports.responseMcpCallInProgressEventSchema = exports.responseMcpCallArgumentsDoneEventSchema = void 0;
exports.parseRealtimeEvent = parseRealtimeEvent;
const zod_1 = require("zod");
// Event schemas mirroring the structures defined in the OpenAI SDK typings.
// Most fields from the interfaces in `realtime.d.ts` are captured here to
// provide better runtime validation when parsing events from the server.
exports.realtimeResponse = zod_1.z.object({
    id: zod_1.z.string().optional().nullable(),
    conversation_id: zod_1.z.string().optional().nullable(),
    max_output_tokens: zod_1.z.number().or(zod_1.z.literal('inf')).optional().nullable(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
    // GA rename: modalities -> output_modalities
    output_modalities: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    object: zod_1.z.literal('realtime.response').optional().nullable(),
    output: zod_1.z.array(zod_1.z.any()).optional().nullable(),
    // GA grouping: audio.output.{format,voice}
    audio: zod_1.z
        .object({
        output: zod_1.z
            .object({
            format: zod_1.z.any().optional().nullable(),
            voice: zod_1.z.string().optional().nullable(),
        })
            .optional()
            .nullable(),
    })
        .optional()
        .nullable(),
    status: zod_1.z
        .enum(['completed', 'incomplete', 'failed', 'cancelled', 'in_progress'])
        .optional()
        .nullable(),
    status_details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
    usage: zod_1.z
        .object({
        input_tokens: zod_1.z.number().optional(),
        input_token_details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
        output_tokens: zod_1.z.number().optional(),
        output_token_details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
    })
        .optional()
        .nullable(),
});
// Basic content schema used by ConversationItem.
exports.conversationItemContentSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    audio: zod_1.z.string().nullable().optional(),
    text: zod_1.z.string().nullable().optional(),
    transcript: zod_1.z.string().nullable().optional(),
    type: zod_1.z.union([
        zod_1.z.literal('input_text'),
        zod_1.z.literal('input_audio'),
        zod_1.z.literal('item_reference'),
        zod_1.z.literal('output_text'),
        zod_1.z.literal('output_audio'),
    ]),
});
exports.conversationItemSchema = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    arguments: zod_1.z.string().optional(),
    call_id: zod_1.z.string().optional(),
    content: zod_1.z.array(exports.conversationItemContentSchema).optional(),
    name: zod_1.z.string().optional(),
    output: zod_1.z.string().nullable().optional(),
    role: zod_1.z.enum(['user', 'assistant', 'system']).optional(),
    status: zod_1.z.enum(['completed', 'incomplete', 'in_progress']).optional(),
    type: zod_1.z
        .enum([
        'message',
        'function_call',
        'function_call_output',
        'mcp_list_tools',
        'mcp_tool_call',
        'mcp_call',
        'mcp_approval_request',
        'mcp_approval_response',
    ])
        .optional(),
    approval_request_id: zod_1.z.string().nullable().optional(),
    approve: zod_1.z.boolean().nullable().optional(),
    reason: zod_1.z.string().nullable().optional(),
    server_label: zod_1.z.string().optional(),
    error: zod_1.z.any().nullable().optional(),
    tools: zod_1.z
        .array(zod_1.z
        .object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        input_schema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    })
        .passthrough())
        .optional(),
})
    .passthrough();
exports.conversationCreatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.created'),
    event_id: zod_1.z.string(),
    conversation: zod_1.z.object({
        id: zod_1.z.string().optional(),
        object: zod_1.z.literal('realtime.conversation').optional(),
    }),
});
// GA rename: conversation.item.created -> conversation.item.added
exports.conversationItemAddedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.added'),
    event_id: zod_1.z.string(),
    item: exports.conversationItemSchema,
    previous_item_id: zod_1.z.string().nullable().optional(),
});
// GA addition: conversation.item.done
exports.conversationItemDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.done'),
    event_id: zod_1.z.string(),
    item: exports.conversationItemSchema,
    previous_item_id: zod_1.z.string().nullable().optional(),
});
exports.conversationItemDeletedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.deleted'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
});
exports.conversationItemInputAudioTranscriptionCompletedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.input_audio_transcription.completed'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    transcript: zod_1.z.string(),
    logprobs: zod_1.z.array(zod_1.z.any()).nullable().optional(),
    usage: zod_1.z
        .object({
        type: zod_1.z.literal('tokens'),
        total_tokens: zod_1.z.number(),
        input_tokens: zod_1.z.number(),
        input_token_details: zod_1.z.object({
            text_tokens: zod_1.z.number(),
            audio_tokens: zod_1.z.number(),
        }),
        output_tokens: zod_1.z.number(),
    })
        .optional(),
});
exports.conversationItemInputAudioTranscriptionDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.input_audio_transcription.delta'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number().optional(),
    delta: zod_1.z.string().optional(),
    logprobs: zod_1.z.array(zod_1.z.any()).nullable().optional(),
});
exports.conversationItemInputAudioTranscriptionFailedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.input_audio_transcription.failed'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    error: zod_1.z.object({
        code: zod_1.z.string().optional(),
        message: zod_1.z.string().optional(),
        param: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
    }),
});
exports.conversationItemRetrievedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.retrieved'),
    event_id: zod_1.z.string(),
    item: exports.conversationItemSchema,
});
exports.conversationItemTruncatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.truncated'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    audio_end_ms: zod_1.z.number(),
    content_index: zod_1.z.number(),
});
exports.conversationItemCreateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.create'),
    item: exports.conversationItemSchema,
    event_id: zod_1.z.string().optional(),
    previous_item_id: zod_1.z.string().nullable().optional(),
});
exports.conversationItemDeleteEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.delete'),
    item_id: zod_1.z.string(),
    event_id: zod_1.z.string().optional(),
});
exports.conversationItemRetrieveEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.retrieve'),
    item_id: zod_1.z.string(),
    event_id: zod_1.z.string().optional(),
});
exports.conversationItemTruncateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('conversation.item.truncate'),
    item_id: zod_1.z.string(),
    audio_end_ms: zod_1.z.number(),
    content_index: zod_1.z.number(),
    event_id: zod_1.z.string().optional(),
});
exports.errorEventSchema = zod_1.z.object({
    type: zod_1.z.literal('error'),
    event_id: zod_1.z.string().optional(),
    error: zod_1.z.any().optional(),
});
exports.inputAudioBufferClearedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.cleared'),
    event_id: zod_1.z.string(),
});
exports.inputAudioBufferAppendEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.append'),
    audio: zod_1.z.string(),
    event_id: zod_1.z.string().optional(),
});
exports.inputAudioBufferClearEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.clear'),
    event_id: zod_1.z.string().optional(),
});
exports.inputAudioBufferCommitEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.commit'),
    event_id: zod_1.z.string().optional(),
});
exports.inputAudioBufferCommittedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.committed'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    previous_item_id: zod_1.z.string().nullable().optional(),
});
exports.inputAudioBufferSpeechStartedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.speech_started'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    audio_start_ms: zod_1.z.number(),
});
exports.inputAudioBufferSpeechStoppedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('input_audio_buffer.speech_stopped'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    audio_end_ms: zod_1.z.number(),
});
exports.outputAudioBufferStartedEventSchema = zod_1.z
    .object({
    type: zod_1.z.literal('output_audio_buffer.started'),
    event_id: zod_1.z.string(),
})
    .passthrough();
exports.outputAudioBufferStoppedEventSchema = zod_1.z
    .object({
    type: zod_1.z.literal('output_audio_buffer.stopped'),
    event_id: zod_1.z.string(),
})
    .passthrough();
exports.outputAudioBufferClearedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('output_audio_buffer.cleared'),
    event_id: zod_1.z.string(),
});
exports.rateLimitsUpdatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('rate_limits.updated'),
    event_id: zod_1.z.string(),
    rate_limits: zod_1.z.array(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        name: zod_1.z.enum(['requests', 'tokens']).optional(),
        remaining: zod_1.z.number().optional(),
        reset_seconds: zod_1.z.number().optional(),
    })),
});
exports.responseAudioDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_audio.delta'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    delta: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseAudioDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_audio.done'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseAudioTranscriptDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_audio_transcript.delta'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    delta: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseAudioTranscriptDoneEventSchema = zod_1.z.object({
    //  GA may introduce response.output_audio_transcript.done
    type: zod_1.z.literal('response.output_audio_transcript.done'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    transcript: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseContentPartAddedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.content_part.added'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
    part: zod_1.z.object({
        audio: zod_1.z.string().optional(),
        text: zod_1.z.string().optional(),
        transcript: zod_1.z.string().optional(),
        type: zod_1.z.enum(['text', 'audio']).optional(),
    }),
});
exports.responseContentPartDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.content_part.done'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
    part: zod_1.z.object({
        audio: zod_1.z.string().optional(),
        text: zod_1.z.string().optional(),
        transcript: zod_1.z.string().optional(),
        type: zod_1.z.enum(['text', 'audio']).optional(),
    }),
});
exports.responseCreatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.created'),
    event_id: zod_1.z.string(),
    response: exports.realtimeResponse,
});
exports.responseDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.done'),
    event_id: zod_1.z.string(),
    response: exports.realtimeResponse,
});
exports.responseFunctionCallArgumentsDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.function_call_arguments.delta'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    call_id: zod_1.z.string(),
    delta: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseFunctionCallArgumentsDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.function_call_arguments.done'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    call_id: zod_1.z.string(),
    arguments: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseOutputItemAddedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_item.added'),
    event_id: zod_1.z.string(),
    item: exports.conversationItemSchema,
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseOutputItemDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_item.done'),
    event_id: zod_1.z.string(),
    item: exports.conversationItemSchema,
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseTextDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.output_text.delta'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    delta: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.responseTextDoneEventSchema = zod_1.z.object({
    // No rename specified for done; keep response.text.done
    type: zod_1.z.literal('response.output_text.done'),
    event_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    content_index: zod_1.z.number(),
    text: zod_1.z.string(),
    output_index: zod_1.z.number(),
    response_id: zod_1.z.string(),
});
exports.sessionCreatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('session.created'),
    event_id: zod_1.z.string(),
    session: zod_1.z.any(),
});
exports.sessionUpdatedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('session.updated'),
    event_id: zod_1.z.string(),
    session: zod_1.z.any(),
});
exports.responseCancelEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.cancel'),
    event_id: zod_1.z.string().optional(),
    response_id: zod_1.z.string().optional(),
});
exports.responseCreateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.create'),
    event_id: zod_1.z.string().optional(),
    response: zod_1.z.any().optional(),
});
exports.sessionUpdateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('session.update'),
    event_id: zod_1.z.string().optional(),
    session: zod_1.z.any(),
});
exports.mcpListToolsInProgressEventSchema = zod_1.z.object({
    type: zod_1.z.literal('mcp_list_tools.in_progress'),
    event_id: zod_1.z.string().optional(),
    item_id: zod_1.z.string().optional(),
});
exports.mcpListToolsCompletedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('mcp_list_tools.completed'),
    event_id: zod_1.z.string().optional(),
    item_id: zod_1.z.string().optional(),
});
exports.responseMcpCallArgumentsDeltaEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.mcp_call_arguments.delta'),
    event_id: zod_1.z.string(),
    response_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    output_index: zod_1.z.number(),
    delta: zod_1.z.string(),
    obfuscation: zod_1.z.string(),
});
exports.responseMcpCallArgumentsDoneEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.mcp_call_arguments.done'),
    event_id: zod_1.z.string(),
    response_id: zod_1.z.string(),
    item_id: zod_1.z.string(),
    output_index: zod_1.z.number(),
    arguments: zod_1.z.string(),
});
exports.responseMcpCallInProgressEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.mcp_call.in_progress'),
    event_id: zod_1.z.string(),
    output_index: zod_1.z.number(),
    item_id: zod_1.z.string(),
});
exports.responseMcpCallCompletedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('response.mcp_call.completed'),
    event_id: zod_1.z.string(),
    output_index: zod_1.z.number(),
    item_id: zod_1.z.string(),
});
exports.mcpListToolsFailedEventSchema = zod_1.z.object({
    type: zod_1.z.literal('mcp_list_tools.failed'),
    event_id: zod_1.z.string().optional(),
    item_id: zod_1.z.string().optional(),
});
/**
 * This schema is used if an event is unknown to the client. The Realtime API might introduce
 * new events at some point and we should handle them gracefully by treating them as generic events
 * only requiring a type and an optional event_id.
 */
exports.genericEventSchema = zod_1.z
    .object({
    type: zod_1.z.string(),
    event_id: zod_1.z.string().optional().nullable(),
})
    .passthrough();
exports.realtimeServerEventSchema = zod_1.z.discriminatedUnion('type', [
    exports.conversationCreatedEventSchema,
    exports.conversationItemAddedEventSchema,
    exports.conversationItemDoneEventSchema,
    exports.conversationItemDeletedEventSchema,
    exports.conversationItemInputAudioTranscriptionCompletedEventSchema,
    exports.conversationItemInputAudioTranscriptionDeltaEventSchema,
    exports.conversationItemInputAudioTranscriptionFailedEventSchema,
    exports.conversationItemRetrievedEventSchema,
    exports.conversationItemTruncatedEventSchema,
    exports.errorEventSchema,
    exports.inputAudioBufferClearedEventSchema,
    exports.inputAudioBufferCommittedEventSchema,
    exports.inputAudioBufferSpeechStartedEventSchema,
    exports.inputAudioBufferSpeechStoppedEventSchema,
    exports.outputAudioBufferStartedEventSchema,
    exports.outputAudioBufferStoppedEventSchema,
    exports.outputAudioBufferClearedEventSchema,
    exports.rateLimitsUpdatedEventSchema,
    exports.responseAudioDeltaEventSchema,
    exports.responseAudioDoneEventSchema,
    exports.responseAudioTranscriptDeltaEventSchema,
    exports.responseAudioTranscriptDoneEventSchema,
    exports.responseContentPartAddedEventSchema,
    exports.responseContentPartDoneEventSchema,
    exports.responseCreatedEventSchema,
    exports.responseDoneEventSchema,
    exports.responseFunctionCallArgumentsDeltaEventSchema,
    exports.responseFunctionCallArgumentsDoneEventSchema,
    exports.responseOutputItemAddedEventSchema,
    exports.responseOutputItemDoneEventSchema,
    exports.responseTextDeltaEventSchema,
    exports.responseTextDoneEventSchema,
    exports.sessionCreatedEventSchema,
    exports.sessionUpdatedEventSchema,
    exports.mcpListToolsInProgressEventSchema,
    exports.mcpListToolsCompletedEventSchema,
    exports.mcpListToolsFailedEventSchema,
    exports.responseMcpCallArgumentsDeltaEventSchema,
    exports.responseMcpCallArgumentsDoneEventSchema,
    exports.responseMcpCallInProgressEventSchema,
    exports.responseMcpCallCompletedEventSchema,
]);
exports.realtimeClientEventSchema = zod_1.z.discriminatedUnion('type', [
    exports.conversationItemCreateEventSchema,
    exports.conversationItemDeleteEventSchema,
    exports.conversationItemRetrieveEventSchema,
    exports.conversationItemTruncateEventSchema,
    exports.inputAudioBufferAppendEventSchema,
    exports.inputAudioBufferClearEventSchema,
    exports.inputAudioBufferCommitEventSchema,
    exports.responseCancelEventSchema,
    exports.responseCreateEventSchema,
    exports.sessionUpdateEventSchema,
]);
/**
 * Parses a realtime event from the server. If the event is unknown to the client, it will be treated as a generic event.
 * @param event - The event to parse.
 * @returns The parsed event or null if the event is unknown to the client.
 */
function parseRealtimeEvent(event) {
    const raw = JSON.parse(event.data.toString());
    const parsed = exports.realtimeServerEventSchema.safeParse(raw);
    if (!parsed.success) {
        const genericParsed = exports.genericEventSchema.safeParse(raw);
        if (genericParsed.success) {
            return { data: genericParsed.data, isGeneric: true };
        }
        return { data: null, isGeneric: true };
    }
    return { data: parsed.data, isGeneric: false };
}
//# sourceMappingURL=openaiRealtimeEvents.js.map
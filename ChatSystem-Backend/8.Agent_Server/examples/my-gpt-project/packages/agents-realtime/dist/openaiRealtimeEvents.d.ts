import { z } from 'zod';
import type { MessageEvent as WebSocketMessageEvent } from 'ws';
export declare const realtimeResponse: z.ZodObject<{
    id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    conversation_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    max_output_tokens: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"inf">]>>>;
    metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    output_modalities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    object: z.ZodNullable<z.ZodOptional<z.ZodLiteral<"realtime.response">>>;
    output: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
    audio: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        output: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            format: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
            voice: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    status: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        incomplete: "incomplete";
        failed: "failed";
        cancelled: "cancelled";
    }>>>;
    status_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    usage: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        input_tokens: z.ZodOptional<z.ZodNumber>;
        input_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        output_tokens: z.ZodOptional<z.ZodNumber>;
        output_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const conversationItemContentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
}, z.core.$strip>;
export declare const conversationItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    arguments: z.ZodOptional<z.ZodString>;
    call_id: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
    }, z.core.$strip>>>;
    name: z.ZodOptional<z.ZodString>;
    output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    role: z.ZodOptional<z.ZodEnum<{
        user: "user";
        assistant: "assistant";
        system: "system";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        incomplete: "incomplete";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        message: "message";
        function_call: "function_call";
        mcp_call: "mcp_call";
        mcp_tool_call: "mcp_tool_call";
        mcp_approval_request: "mcp_approval_request";
        function_call_output: "function_call_output";
        mcp_list_tools: "mcp_list_tools";
        mcp_approval_response: "mcp_approval_response";
    }>>;
    approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    server_label: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export declare const conversationCreatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.created">;
    event_id: z.ZodString;
    conversation: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        object: z.ZodOptional<z.ZodLiteral<"realtime.conversation">>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const conversationItemAddedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.added">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const conversationItemDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.done">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const conversationItemDeletedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.deleted">;
    event_id: z.ZodString;
    item_id: z.ZodString;
}, z.core.$strip>;
export declare const conversationItemInputAudioTranscriptionCompletedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.completed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    transcript: z.ZodString;
    logprobs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny>>>;
    usage: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"tokens">;
        total_tokens: z.ZodNumber;
        input_tokens: z.ZodNumber;
        input_token_details: z.ZodObject<{
            text_tokens: z.ZodNumber;
            audio_tokens: z.ZodNumber;
        }, z.core.$strip>;
        output_tokens: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const conversationItemInputAudioTranscriptionDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodOptional<z.ZodNumber>;
    delta: z.ZodOptional<z.ZodString>;
    logprobs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny>>>;
}, z.core.$strip>;
export declare const conversationItemInputAudioTranscriptionFailedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.failed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    error: z.ZodObject<{
        code: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        param: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const conversationItemRetrievedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.retrieved">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, z.core.$strip>;
export declare const conversationItemTruncatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.truncated">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
    content_index: z.ZodNumber;
}, z.core.$strip>;
export declare const conversationItemCreateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.create">;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    event_id: z.ZodOptional<z.ZodString>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const conversationItemDeleteEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.delete">;
    item_id: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const conversationItemRetrieveEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.retrieve">;
    item_id: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const conversationItemTruncateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.truncate">;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
    content_index: z.ZodNumber;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const errorEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    event_id: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const inputAudioBufferClearedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.cleared">;
    event_id: z.ZodString;
}, z.core.$strip>;
export declare const inputAudioBufferAppendEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.append">;
    audio: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const inputAudioBufferClearEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.clear">;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const inputAudioBufferCommitEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.commit">;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const inputAudioBufferCommittedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.committed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const inputAudioBufferSpeechStartedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.speech_started">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_start_ms: z.ZodNumber;
}, z.core.$strip>;
export declare const inputAudioBufferSpeechStoppedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.speech_stopped">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
}, z.core.$strip>;
export declare const outputAudioBufferStartedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.started">;
    event_id: z.ZodString;
}, z.core.$loose>;
export declare const outputAudioBufferStoppedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.stopped">;
    event_id: z.ZodString;
}, z.core.$loose>;
export declare const outputAudioBufferClearedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.cleared">;
    event_id: z.ZodString;
}, z.core.$strip>;
export declare const rateLimitsUpdatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"rate_limits.updated">;
    event_id: z.ZodString;
    rate_limits: z.ZodArray<z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodEnum<{
            tokens: "tokens";
            requests: "requests";
        }>>;
        remaining: z.ZodOptional<z.ZodNumber>;
        reset_seconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const responseAudioDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseAudioDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseAudioTranscriptDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio_transcript.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseAudioTranscriptDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio_transcript.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    transcript: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseContentPartAddedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.content_part.added">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
    part: z.ZodObject<{
        audio: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            audio: "audio";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const responseContentPartDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.content_part.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
    part: z.ZodObject<{
        audio: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            audio: "audio";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const responseCreatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.created">;
    event_id: z.ZodString;
    response: z.ZodObject<{
        id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        conversation_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        max_output_tokens: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"inf">]>>>;
        metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        output_modalities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        object: z.ZodNullable<z.ZodOptional<z.ZodLiteral<"realtime.response">>>;
        output: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
        audio: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            output: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                format: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
                voice: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
            failed: "failed";
            cancelled: "cancelled";
        }>>>;
        status_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        usage: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            input_tokens: z.ZodOptional<z.ZodNumber>;
            input_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
            output_tokens: z.ZodOptional<z.ZodNumber>;
            output_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const responseDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.done">;
    event_id: z.ZodString;
    response: z.ZodObject<{
        id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        conversation_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        max_output_tokens: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"inf">]>>>;
        metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        output_modalities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        object: z.ZodNullable<z.ZodOptional<z.ZodLiteral<"realtime.response">>>;
        output: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
        audio: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            output: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                format: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
                voice: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
            failed: "failed";
            cancelled: "cancelled";
        }>>>;
        status_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        usage: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            input_tokens: z.ZodOptional<z.ZodNumber>;
            input_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
            output_tokens: z.ZodOptional<z.ZodNumber>;
            output_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const responseFunctionCallArgumentsDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.function_call_arguments.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    call_id: z.ZodString;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseFunctionCallArgumentsDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.function_call_arguments.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    call_id: z.ZodString;
    arguments: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseOutputItemAddedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_item.added">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseOutputItemDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_item.done">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseTextDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_text.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const responseTextDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.output_text.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    text: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>;
export declare const sessionCreatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"session.created">;
    event_id: z.ZodString;
    session: z.ZodAny;
}, z.core.$strip>;
export declare const sessionUpdatedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"session.updated">;
    event_id: z.ZodString;
    session: z.ZodAny;
}, z.core.$strip>;
export declare const responseCancelEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.cancel">;
    event_id: z.ZodOptional<z.ZodString>;
    response_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const responseCreateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.create">;
    event_id: z.ZodOptional<z.ZodString>;
    response: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const sessionUpdateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"session.update">;
    event_id: z.ZodOptional<z.ZodString>;
    session: z.ZodAny;
}, z.core.$strip>;
export declare const mcpListToolsInProgressEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.in_progress">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const mcpListToolsCompletedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.completed">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const responseMcpCallArgumentsDeltaEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call_arguments.delta">;
    event_id: z.ZodString;
    response_id: z.ZodString;
    item_id: z.ZodString;
    output_index: z.ZodNumber;
    delta: z.ZodString;
    obfuscation: z.ZodString;
}, z.core.$strip>;
export declare const responseMcpCallArgumentsDoneEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call_arguments.done">;
    event_id: z.ZodString;
    response_id: z.ZodString;
    item_id: z.ZodString;
    output_index: z.ZodNumber;
    arguments: z.ZodString;
}, z.core.$strip>;
export declare const responseMcpCallInProgressEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call.in_progress">;
    event_id: z.ZodString;
    output_index: z.ZodNumber;
    item_id: z.ZodString;
}, z.core.$strip>;
export declare const responseMcpCallCompletedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call.completed">;
    event_id: z.ZodString;
    output_index: z.ZodNumber;
    item_id: z.ZodString;
}, z.core.$strip>;
export declare const mcpListToolsFailedEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.failed">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * This schema is used if an event is unknown to the client. The Realtime API might introduce
 * new events at some point and we should handle them gracefully by treating them as generic events
 * only requiring a type and an optional event_id.
 */
export declare const genericEventSchema: z.ZodObject<{
    type: z.ZodString;
    event_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$loose>;
export declare const realtimeServerEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"conversation.created">;
    event_id: z.ZodString;
    conversation: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        object: z.ZodOptional<z.ZodLiteral<"realtime.conversation">>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.added">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.done">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.deleted">;
    event_id: z.ZodString;
    item_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.completed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    transcript: z.ZodString;
    logprobs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny>>>;
    usage: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"tokens">;
        total_tokens: z.ZodNumber;
        input_tokens: z.ZodNumber;
        input_token_details: z.ZodObject<{
            text_tokens: z.ZodNumber;
            audio_tokens: z.ZodNumber;
        }, z.core.$strip>;
        output_tokens: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodOptional<z.ZodNumber>;
    delta: z.ZodOptional<z.ZodString>;
    logprobs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.input_audio_transcription.failed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    error: z.ZodObject<{
        code: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        param: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.retrieved">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.truncated">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
    content_index: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    event_id: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.cleared">;
    event_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.committed">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.speech_started">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_start_ms: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.speech_stopped">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.started">;
    event_id: z.ZodString;
}, z.core.$loose>, z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.stopped">;
    event_id: z.ZodString;
}, z.core.$loose>, z.ZodObject<{
    type: z.ZodLiteral<"output_audio_buffer.cleared">;
    event_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"rate_limits.updated">;
    event_id: z.ZodString;
    rate_limits: z.ZodArray<z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodEnum<{
            tokens: "tokens";
            requests: "requests";
        }>>;
        remaining: z.ZodOptional<z.ZodNumber>;
        reset_seconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio_transcript.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_audio_transcript.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    transcript: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.content_part.added">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
    part: z.ZodObject<{
        audio: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            audio: "audio";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.content_part.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
    part: z.ZodObject<{
        audio: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            audio: "audio";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.created">;
    event_id: z.ZodString;
    response: z.ZodObject<{
        id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        conversation_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        max_output_tokens: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"inf">]>>>;
        metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        output_modalities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        object: z.ZodNullable<z.ZodOptional<z.ZodLiteral<"realtime.response">>>;
        output: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
        audio: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            output: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                format: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
                voice: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
            failed: "failed";
            cancelled: "cancelled";
        }>>>;
        status_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        usage: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            input_tokens: z.ZodOptional<z.ZodNumber>;
            input_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
            output_tokens: z.ZodOptional<z.ZodNumber>;
            output_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.done">;
    event_id: z.ZodString;
    response: z.ZodObject<{
        id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        conversation_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        max_output_tokens: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"inf">]>>>;
        metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        output_modalities: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        object: z.ZodNullable<z.ZodOptional<z.ZodLiteral<"realtime.response">>>;
        output: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
        audio: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            output: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                format: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
                voice: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        status: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
            failed: "failed";
            cancelled: "cancelled";
        }>>>;
        status_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        usage: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            input_tokens: z.ZodOptional<z.ZodNumber>;
            input_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
            output_tokens: z.ZodOptional<z.ZodNumber>;
            output_token_details: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.function_call_arguments.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    call_id: z.ZodString;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.function_call_arguments.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    call_id: z.ZodString;
    arguments: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_item.added">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_item.done">;
    event_id: z.ZodString;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_text.delta">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    delta: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.output_text.done">;
    event_id: z.ZodString;
    item_id: z.ZodString;
    content_index: z.ZodNumber;
    text: z.ZodString;
    output_index: z.ZodNumber;
    response_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"session.created">;
    event_id: z.ZodString;
    session: z.ZodAny;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"session.updated">;
    event_id: z.ZodString;
    session: z.ZodAny;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.in_progress">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.completed">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mcp_list_tools.failed">;
    event_id: z.ZodOptional<z.ZodString>;
    item_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call_arguments.delta">;
    event_id: z.ZodString;
    response_id: z.ZodString;
    item_id: z.ZodString;
    output_index: z.ZodNumber;
    delta: z.ZodString;
    obfuscation: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call_arguments.done">;
    event_id: z.ZodString;
    response_id: z.ZodString;
    item_id: z.ZodString;
    output_index: z.ZodNumber;
    arguments: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call.in_progress">;
    event_id: z.ZodString;
    output_index: z.ZodNumber;
    item_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.mcp_call.completed">;
    event_id: z.ZodString;
    output_index: z.ZodNumber;
    item_id: z.ZodString;
}, z.core.$strip>], "type">;
export declare const realtimeClientEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.create">;
    item: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        arguments: z.ZodOptional<z.ZodString>;
        call_id: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            audio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"input_text">, z.ZodLiteral<"input_audio">, z.ZodLiteral<"item_reference">, z.ZodLiteral<"output_text">, z.ZodLiteral<"output_audio">]>;
        }, z.core.$strip>>>;
        name: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
            system: "system";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            message: "message";
            function_call: "function_call";
            mcp_call: "mcp_call";
            mcp_tool_call: "mcp_tool_call";
            mcp_approval_request: "mcp_approval_request";
            function_call_output: "function_call_output";
            mcp_list_tools: "mcp_list_tools";
            mcp_approval_response: "mcp_approval_response";
        }>>;
        approval_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        approve: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        server_label: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodAny>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    event_id: z.ZodOptional<z.ZodString>;
    previous_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.delete">;
    item_id: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.retrieve">;
    item_id: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"conversation.item.truncate">;
    item_id: z.ZodString;
    audio_end_ms: z.ZodNumber;
    content_index: z.ZodNumber;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.append">;
    audio: z.ZodString;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.clear">;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"input_audio_buffer.commit">;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.cancel">;
    event_id: z.ZodOptional<z.ZodString>;
    response_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"response.create">;
    event_id: z.ZodOptional<z.ZodString>;
    response: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"session.update">;
    event_id: z.ZodOptional<z.ZodString>;
    session: z.ZodAny;
}, z.core.$strip>], "type">;
export type RealtimeServerGenericEvent = z.infer<typeof genericEventSchema> & Record<string, any>;
export type RealtimeServerEvent = z.infer<typeof realtimeServerEventSchema> & Record<string, any>;
export type RealtimeClientEvent = z.infer<typeof realtimeClientEventSchema> & Record<string, any>;
type ParseResult = {
    data: RealtimeServerEvent;
    isGeneric: false;
} | {
    data: RealtimeServerGenericEvent;
    isGeneric: true;
} | {
    data: null;
    isGeneric: true;
};
/**
 * Parses a realtime event from the server. If the event is unknown to the client, it will be treated as a generic event.
 * @param event - The event to parse.
 * @returns The parsed event or null if the event is unknown to the client.
 */
export declare function parseRealtimeEvent(event: MessageEvent | WebSocketMessageEvent): ParseResult;
export {};

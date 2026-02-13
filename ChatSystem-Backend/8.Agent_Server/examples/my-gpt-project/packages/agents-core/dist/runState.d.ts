import { z } from 'zod';
import { Agent } from './agent';
import { RunItem, RunToolApprovalItem } from './items';
import type { ModelResponse, ModelSettings } from './model';
import { RunContext } from './runContext';
import { AgentToolUseTracker } from './runner/toolUseTracker';
import { NextStep } from './runner/steps';
import type { ProcessedResponse } from './runner/types';
import type { AgentSpanData, Span } from './tracing/spans';
import { Usage } from './usage';
import { Trace } from './tracing/traces';
import { AgentInputItem } from './types';
import type { InputGuardrailResult, OutputGuardrailResult } from './guardrail';
import type { ToolInputGuardrailResult, ToolOutputGuardrailResult } from './toolGuardrail';
/**
 * The schema version of the serialized run state. This is used to ensure that the serialized
 * run state is compatible with the current version of the SDK.
 * If anything in this schema changes, the version will have to be incremented.
 *
 * Version history.
 * - 1.0: Initial serialized RunState schema.
 * - 1.1: Adds optional currentTurnInProgress, conversationId, and previousResponseId fields,
 *   plus broader tool_call_output_item rawItem variants for non-function tools. Older 1.0
 *   payloads remain readable but resumes may lack mid-turn or server-managed context precision.
 */
export declare const CURRENT_SCHEMA_VERSION: "1.1";
declare const serializedSpanBase: z.ZodObject<{
    object: z.ZodLiteral<"trace.span">;
    id: z.ZodString;
    trace_id: z.ZodString;
    parent_id: z.ZodNullable<z.ZodString>;
    started_at: z.ZodNullable<z.ZodString>;
    ended_at: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodObject<{
        message: z.ZodString;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    span_data: z.ZodRecord<z.ZodString, z.ZodAny>;
}, z.core.$strip>;
type SerializedSpanType = z.infer<typeof serializedSpanBase> & {
    previous_span?: SerializedSpanType;
};
export declare const SerializedRunState: z.ZodObject<{
    $schemaVersion: z.ZodEnum<{
        "1.0": "1.0";
        1.1: "1.1";
    }>;
    currentTurn: z.ZodNumber;
    currentAgent: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    originalInput: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodLiteral<"message">>;
        role: z.ZodLiteral<"user">;
        content: z.ZodUnion<[z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_image">;
            image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_file">;
            file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>, z.ZodObject<{
                url: z.ZodString;
            }, z.core.$strip>]>>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"audio">;
            audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>;
            format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>], "type">>, z.ZodString]>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodLiteral<"message">>;
        role: z.ZodLiteral<"assistant">;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>;
        content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"output_text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"refusal">;
            refusal: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"audio">;
            audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>;
            format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"image">;
            image: z.ZodString;
        }, z.core.$strip>], "type">>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodLiteral<"message">>;
        role: z.ZodLiteral<"system">;
        content: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"hosted_tool_call">;
        name: z.ZodString;
        arguments: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"function_call">;
        callId: z.ZodString;
        name: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        arguments: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"computer_call">;
        callId: z.ZodString;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>;
        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"screenshot">;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"click">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            button: z.ZodEnum<{
                left: "left";
                right: "right";
                wheel: "wheel";
                back: "back";
                forward: "forward";
            }>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"double_click">;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"scroll">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            scroll_x: z.ZodNumber;
            scroll_y: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"type">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"wait">;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"move">;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"keypress">;
            keys: z.ZodArray<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"drag">;
            path: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>], "type">;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"shell_call">;
        callId: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>>;
        action: z.ZodObject<{
            commands: z.ZodArray<z.ZodString>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            maxOutputLength: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"apply_patch_call">;
        callId: z.ZodString;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
        }>;
        operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"create_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"update_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"delete_file">;
            path: z.ZodString;
        }, z.core.$strip>], "type">;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"function_call_result">;
        name: z.ZodString;
        callId: z.ZodString;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            completed: "completed";
            incomplete: "incomplete";
        }>;
        output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"image">;
            image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                mediaType: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                url: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                fileId: z.ZodString;
            }, z.core.$strip>]>]>>;
            detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"file">;
            file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                mediaType: z.ZodString;
                filename: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                url: z.ZodString;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                id: z.ZodString;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>]>;
        }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_image">;
            image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_file">;
            file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>]>, z.ZodObject<{
                url: z.ZodString;
            }, z.core.$strip>]>>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>]>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"computer_call_result">;
        callId: z.ZodString;
        output: z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"computer_screenshot">;
            data: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"shell_call_output">;
        callId: z.ZodString;
        maxOutputLength: z.ZodOptional<z.ZodNumber>;
        output: z.ZodArray<z.ZodObject<{
            stdout: z.ZodString;
            stderr: z.ZodString;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"timeout">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"exit">;
                exitCode: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strip>], "type">;
        }, z.core.$loose>>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"apply_patch_call_output">;
        callId: z.ZodString;
        status: z.ZodEnum<{
            completed: "completed";
            failed: "failed";
        }>;
        output: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"reasoning">;
        content: z.ZodArray<z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"input_text">;
            text: z.ZodString;
        }, z.core.$strip>>;
        rawContent: z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"reasoning_text">;
            text: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        type: z.ZodLiteral<"compaction">;
        encrypted_content: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        created_by: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodLiteral<"unknown">;
    }, z.core.$strip>]>>]>;
    modelResponses: z.ZodArray<z.ZodObject<{
        usage: z.ZodObject<{
            requests: z.ZodNumber;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            totalTokens: z.ZodNumber;
            inputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            outputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            requestUsageEntries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                inputTokens: z.ZodNumber;
                outputTokens: z.ZodNumber;
                totalTokens: z.ZodNumber;
                inputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                outputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                endpoint: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        output: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodLiteral<"message">>;
            role: z.ZodLiteral<"assistant">;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"output_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"refusal">;
                refusal: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"audio">;
                audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>;
                format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodString;
            }, z.core.$strip>], "type">>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"hosted_tool_call">;
            name: z.ZodString;
            arguments: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call">;
            callId: z.ZodString;
            name: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            arguments: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"computer_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"screenshot">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                button: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    wheel: "wheel";
                    back: "back";
                    forward: "forward";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"double_click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"scroll">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                scroll_x: z.ZodNumber;
                scroll_y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"type">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"wait">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"move">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"keypress">;
                keys: z.ZodArray<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"drag">;
                path: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call">;
            callId: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            action: z.ZodObject<{
                commands: z.ZodArray<z.ZodString>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                maxOutputLength: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
            }>;
            operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"create_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_file">;
                path: z.ZodString;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call_result">;
            name: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    fileId: z.ZodString;
                }, z.core.$strip>]>]>>;
                detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"file">;
                file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodString;
                    filename: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>]>;
            }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_file">;
                file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>]>>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>], "type">>]>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call_output">;
            callId: z.ZodString;
            maxOutputLength: z.ZodOptional<z.ZodNumber>;
            output: z.ZodArray<z.ZodObject<{
                stdout: z.ZodString;
                stderr: z.ZodString;
                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"timeout">;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"exit">;
                    exitCode: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>], "type">;
            }, z.core.$loose>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call_output">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
            }>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"reasoning">;
            content: z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>>;
            rawContent: z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"reasoning_text">;
                text: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"compaction">;
            encrypted_content: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            created_by: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"unknown">;
        }, z.core.$strip>], "type">>;
        responseId: z.ZodOptional<z.ZodString>;
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    context: z.ZodObject<{
        usage: z.ZodObject<{
            requests: z.ZodNumber;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            totalTokens: z.ZodNumber;
            inputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            outputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            requestUsageEntries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                inputTokens: z.ZodNumber;
                outputTokens: z.ZodNumber;
                totalTokens: z.ZodNumber;
                inputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                outputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                endpoint: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        approvals: z.ZodRecord<z.ZodString, z.ZodObject<{
            approved: z.ZodUnion<[z.ZodArray<z.ZodString>, z.ZodBoolean]>;
            rejected: z.ZodUnion<[z.ZodArray<z.ZodString>, z.ZodBoolean]>;
        }, z.core.$strip>>;
        context: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>;
    toolUseTracker: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
    maxTurns: z.ZodNumber;
    currentAgentSpan: z.ZodOptional<z.ZodNullable<z.ZodType<SerializedSpanType, unknown, z.core.$ZodTypeInternals<SerializedSpanType, unknown>>>>;
    noActiveAgentRun: z.ZodBoolean;
    inputGuardrailResults: z.ZodArray<z.ZodObject<{
        guardrail: z.ZodObject<{
            type: z.ZodLiteral<"input">;
            name: z.ZodString;
        }, z.core.$strip>;
        output: z.ZodObject<{
            tripwireTriggered: z.ZodBoolean;
            outputInfo: z.ZodAny;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    outputGuardrailResults: z.ZodArray<z.ZodObject<{
        guardrail: z.ZodObject<{
            type: z.ZodLiteral<"output">;
            name: z.ZodString;
        }, z.core.$strip>;
        agentOutput: z.ZodAny;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
        output: z.ZodObject<{
            tripwireTriggered: z.ZodBoolean;
            outputInfo: z.ZodAny;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    toolInputGuardrailResults: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        guardrail: z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"tool_input">;
        }, z.core.$strip>;
        output: z.ZodObject<{
            outputInfo: z.ZodOptional<z.ZodAny>;
            behavior: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"allow">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"rejectContent">;
                message: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"throwException">;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>;
    }, z.core.$strip>>>>;
    toolOutputGuardrailResults: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        guardrail: z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"tool_output">;
        }, z.core.$strip>;
        output: z.ZodObject<{
            outputInfo: z.ZodOptional<z.ZodAny>;
            behavior: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"allow">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"rejectContent">;
                message: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"throwException">;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>;
    }, z.core.$strip>>>>;
    currentTurnInProgress: z.ZodOptional<z.ZodBoolean>;
    currentStep: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"next_step_handoff">;
        newAgent: z.ZodAny;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"next_step_final_output">;
        output: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"next_step_run_again">;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"next_step_interruption">;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>], "type">>;
    lastModelResponse: z.ZodOptional<z.ZodObject<{
        usage: z.ZodObject<{
            requests: z.ZodNumber;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            totalTokens: z.ZodNumber;
            inputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            outputTokensDetails: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            requestUsageEntries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                inputTokens: z.ZodNumber;
                outputTokens: z.ZodNumber;
                totalTokens: z.ZodNumber;
                inputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                outputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                endpoint: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        output: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodLiteral<"message">>;
            role: z.ZodLiteral<"assistant">;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"output_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"refusal">;
                refusal: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"audio">;
                audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>;
                format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodString;
            }, z.core.$strip>], "type">>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"hosted_tool_call">;
            name: z.ZodString;
            arguments: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call">;
            callId: z.ZodString;
            name: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            arguments: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"computer_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"screenshot">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                button: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    wheel: "wheel";
                    back: "back";
                    forward: "forward";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"double_click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"scroll">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                scroll_x: z.ZodNumber;
                scroll_y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"type">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"wait">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"move">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"keypress">;
                keys: z.ZodArray<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"drag">;
                path: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call">;
            callId: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            action: z.ZodObject<{
                commands: z.ZodArray<z.ZodString>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                maxOutputLength: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
            }>;
            operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"create_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_file">;
                path: z.ZodString;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call_result">;
            name: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    fileId: z.ZodString;
                }, z.core.$strip>]>]>>;
                detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"file">;
                file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodString;
                    filename: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>]>;
            }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_file">;
                file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>]>>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>], "type">>]>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call_output">;
            callId: z.ZodString;
            maxOutputLength: z.ZodOptional<z.ZodNumber>;
            output: z.ZodArray<z.ZodObject<{
                stdout: z.ZodString;
                stderr: z.ZodString;
                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"timeout">;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"exit">;
                    exitCode: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>], "type">;
            }, z.core.$loose>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call_output">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
            }>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"reasoning">;
            content: z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>>;
            rawContent: z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"reasoning_text">;
                text: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            type: z.ZodLiteral<"compaction">;
            encrypted_content: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            created_by: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"unknown">;
        }, z.core.$strip>], "type">>;
        responseId: z.ZodOptional<z.ZodString>;
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    generatedItems: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"message_output_item">;
        rawItem: z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodLiteral<"message">>;
            role: z.ZodLiteral<"assistant">;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"output_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"refusal">;
                refusal: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"audio">;
                audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>;
                format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodString;
            }, z.core.$strip>], "type">>;
        }, z.core.$strip>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"tool_call_item">;
        rawItem: z.ZodUnion<[z.ZodDiscriminatedUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"computer_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"screenshot">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                button: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    wheel: "wheel";
                    back: "back";
                    forward: "forward";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"double_click">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"scroll">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                scroll_x: z.ZodNumber;
                scroll_y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"type">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"wait">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"move">;
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"keypress">;
                keys: z.ZodArray<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"drag">;
                path: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call">;
            callId: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            action: z.ZodObject<{
                commands: z.ZodArray<z.ZodString>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                maxOutputLength: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
            }>;
            operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"create_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_file">;
                path: z.ZodString;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call">;
            callId: z.ZodString;
            name: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            arguments: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"hosted_tool_call">;
            name: z.ZodString;
            arguments: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"hosted_tool_call">;
            name: z.ZodString;
            arguments: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>]>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"tool_call_output_item">;
        rawItem: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call_result">;
            name: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    fileId: z.ZodString;
                }, z.core.$strip>]>]>>;
                detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"file">;
                file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodString;
                    filename: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>]>;
            }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_file">;
                file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>]>>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>], "type">>]>;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"computer_call_result">;
            callId: z.ZodString;
            output: z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"computer_screenshot">;
                data: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>]>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call_output">;
            callId: z.ZodString;
            maxOutputLength: z.ZodOptional<z.ZodNumber>;
            output: z.ZodArray<z.ZodObject<{
                stdout: z.ZodString;
                stderr: z.ZodString;
                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"timeout">;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"exit">;
                    exitCode: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>], "type">;
            }, z.core.$loose>>;
        }, z.core.$strip>]>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call_output">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
            }>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>]>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
        output: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"reasoning_item">;
        rawItem: z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"reasoning">;
            content: z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>>;
            rawContent: z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"reasoning_text">;
                text: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"handoff_call_item">;
        rawItem: z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call">;
            callId: z.ZodString;
            name: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            arguments: z.ZodString;
        }, z.core.$strip>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"handoff_output_item">;
        rawItem: z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call_result">;
            name: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>;
            output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    fileId: z.ZodString;
                }, z.core.$strip>]>]>>;
                detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"file">;
                file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                    data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                    mediaType: z.ZodString;
                    filename: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    url: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    id: z.ZodString;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>]>;
            }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_text">;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_image">;
                image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                type: z.ZodLiteral<"input_file">;
                file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                    id: z.ZodString;
                }, z.core.$strip>]>, z.ZodObject<{
                    url: z.ZodString;
                }, z.core.$strip>]>>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>], "type">>]>;
        }, z.core.$strip>;
        sourceAgent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
        targetAgent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"tool_approval_item">;
        rawItem: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"function_call">;
            callId: z.ZodString;
            name: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            arguments: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"hosted_tool_call">;
            name: z.ZodString;
            arguments: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            output: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>]>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"shell_call">;
            callId: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
                incomplete: "incomplete";
            }>>;
            action: z.ZodObject<{
                commands: z.ZodArray<z.ZodString>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                maxOutputLength: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>]>, z.ZodObject<{
            providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"apply_patch_call">;
            callId: z.ZodString;
            status: z.ZodEnum<{
                in_progress: "in_progress";
                completed: "completed";
            }>;
            operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"create_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_file">;
                path: z.ZodString;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>]>;
        agent: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
        toolName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>;
    lastProcessedResponse: z.ZodOptional<z.ZodObject<{
        newItems: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"message_output_item">;
            rawItem: z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodOptional<z.ZodLiteral<"message">>;
                role: z.ZodLiteral<"assistant">;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>;
                content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"output_text">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"refusal">;
                    refusal: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"audio">;
                    audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
                        id: z.ZodString;
                    }, z.core.$strip>]>;
                    format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"image">;
                    image: z.ZodString;
                }, z.core.$strip>], "type">>;
            }, z.core.$strip>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"tool_call_item">;
            rawItem: z.ZodUnion<[z.ZodDiscriminatedUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"computer_call">;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"screenshot">;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"click">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    button: z.ZodEnum<{
                        left: "left";
                        right: "right";
                        wheel: "wheel";
                        back: "back";
                        forward: "forward";
                    }>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"double_click">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"scroll">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    scroll_x: z.ZodNumber;
                    scroll_y: z.ZodNumber;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"type">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"wait">;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"move">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"keypress">;
                    keys: z.ZodArray<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"drag">;
                    path: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strip>>;
                }, z.core.$strip>], "type">;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"shell_call">;
                callId: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>>;
                action: z.ZodObject<{
                    commands: z.ZodArray<z.ZodString>;
                    timeoutMs: z.ZodOptional<z.ZodNumber>;
                    maxOutputLength: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"apply_patch_call">;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                }>;
                operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"create_file">;
                    path: z.ZodString;
                    diff: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"update_file">;
                    path: z.ZodString;
                    diff: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"delete_file">;
                    path: z.ZodString;
                }, z.core.$strip>], "type">;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"function_call">;
                callId: z.ZodString;
                name: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>>;
                arguments: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"hosted_tool_call">;
                name: z.ZodString;
                arguments: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
                output: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>], "type">, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"hosted_tool_call">;
                name: z.ZodString;
                arguments: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
                output: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>]>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"tool_call_output_item">;
            rawItem: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"function_call_result">;
                name: z.ZodString;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>;
                output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"text">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"image">;
                    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                        data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                        mediaType: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodObject<{
                        url: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        fileId: z.ZodString;
                    }, z.core.$strip>]>]>>;
                    detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"file">;
                    file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                        data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                        mediaType: z.ZodString;
                        filename: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        url: z.ZodString;
                        filename: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodObject<{
                        id: z.ZodString;
                        filename: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>]>;
                }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_text">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_image">;
                    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                        id: z.ZodString;
                    }, z.core.$strip>]>>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_file">;
                    file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                        id: z.ZodString;
                    }, z.core.$strip>]>, z.ZodObject<{
                        url: z.ZodString;
                    }, z.core.$strip>]>>;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>], "type">>]>;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"computer_call_result">;
                callId: z.ZodString;
                output: z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"computer_screenshot">;
                    data: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>]>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"shell_call_output">;
                callId: z.ZodString;
                maxOutputLength: z.ZodOptional<z.ZodNumber>;
                output: z.ZodArray<z.ZodObject<{
                    stdout: z.ZodString;
                    stderr: z.ZodString;
                    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"timeout">;
                    }, z.core.$strip>, z.ZodObject<{
                        type: z.ZodLiteral<"exit">;
                        exitCode: z.ZodNullable<z.ZodNumber>;
                    }, z.core.$strip>], "type">;
                }, z.core.$loose>>;
            }, z.core.$strip>]>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"apply_patch_call_output">;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                }>;
                output: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>]>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
            output: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"reasoning_item">;
            rawItem: z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"reasoning">;
                content: z.ZodArray<z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_text">;
                    text: z.ZodString;
                }, z.core.$strip>>;
                rawContent: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"reasoning_text">;
                    text: z.ZodString;
                }, z.core.$strip>>>;
            }, z.core.$strip>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"handoff_call_item">;
            rawItem: z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"function_call">;
                callId: z.ZodString;
                name: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>>;
                arguments: z.ZodString;
            }, z.core.$strip>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"handoff_output_item">;
            rawItem: z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"function_call_result">;
                name: z.ZodString;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>;
                output: z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"text">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"image">;
                    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
                        data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                        mediaType: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodObject<{
                        url: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        fileId: z.ZodString;
                    }, z.core.$strip>]>]>>;
                    detail: z.ZodOptional<z.ZodType<"low" | "high" | "auto" | (string & {}), unknown, z.core.$ZodTypeInternals<"low" | "high" | "auto" | (string & {}), unknown>>>;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"file">;
                    file: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                        data: z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>]>;
                        mediaType: z.ZodString;
                        filename: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        url: z.ZodString;
                        filename: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodObject<{
                        id: z.ZodString;
                        filename: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>]>;
                }, z.core.$strip>], "type">, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_text">;
                    text: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_image">;
                    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                        id: z.ZodString;
                    }, z.core.$strip>]>>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    type: z.ZodLiteral<"input_file">;
                    file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
                        id: z.ZodString;
                    }, z.core.$strip>]>, z.ZodObject<{
                        url: z.ZodString;
                    }, z.core.$strip>]>>;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>], "type">>]>;
            }, z.core.$strip>;
            sourceAgent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
            targetAgent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"tool_approval_item">;
            rawItem: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"function_call">;
                callId: z.ZodString;
                name: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>>;
                arguments: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"hosted_tool_call">;
                name: z.ZodString;
                arguments: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
                output: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>]>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"shell_call">;
                callId: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                    incomplete: "incomplete";
                }>>;
                action: z.ZodObject<{
                    commands: z.ZodArray<z.ZodString>;
                    timeoutMs: z.ZodOptional<z.ZodNumber>;
                    maxOutputLength: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
            }, z.core.$strip>]>, z.ZodObject<{
                providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                id: z.ZodOptional<z.ZodString>;
                type: z.ZodLiteral<"apply_patch_call">;
                callId: z.ZodString;
                status: z.ZodEnum<{
                    in_progress: "in_progress";
                    completed: "completed";
                }>;
                operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"create_file">;
                    path: z.ZodString;
                    diff: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"update_file">;
                    path: z.ZodString;
                    diff: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"delete_file">;
                    path: z.ZodString;
                }, z.core.$strip>], "type">;
            }, z.core.$strip>]>;
            agent: z.ZodObject<{
                name: z.ZodString;
            }, z.core.$strip>;
            toolName: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>;
        toolsUsed: z.ZodArray<z.ZodString>;
        handoffs: z.ZodArray<z.ZodObject<{
            toolCall: z.ZodAny;
            handoff: z.ZodAny;
        }, z.core.$strip>>;
        functions: z.ZodArray<z.ZodObject<{
            toolCall: z.ZodAny;
            tool: z.ZodAny;
        }, z.core.$strip>>;
        computerActions: z.ZodArray<z.ZodObject<{
            toolCall: z.ZodAny;
            computer: z.ZodAny;
        }, z.core.$strip>>;
        shellActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            toolCall: z.ZodAny;
            shell: z.ZodAny;
        }, z.core.$strip>>>;
        applyPatchActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            toolCall: z.ZodAny;
            applyPatch: z.ZodAny;
        }, z.core.$strip>>>;
        mcpApprovalRequests: z.ZodOptional<z.ZodArray<z.ZodObject<{
            requestItem: z.ZodObject<{
                rawItem: z.ZodObject<{
                    type: z.ZodLiteral<"hosted_tool_call">;
                    name: z.ZodString;
                    arguments: z.ZodOptional<z.ZodString>;
                    status: z.ZodOptional<z.ZodString>;
                    output: z.ZodOptional<z.ZodString>;
                    providerData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>;
                }, z.core.$strip>;
            }, z.core.$strip>;
            mcpTool: z.ZodObject<{
                type: z.ZodLiteral<"hosted_tool">;
                name: z.ZodLiteral<"hosted_mcp">;
                providerData: z.ZodRecord<z.ZodString, z.ZodAny>;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    currentTurnPersistedItemCount: z.ZodOptional<z.ZodNumber>;
    conversationId: z.ZodOptional<z.ZodString>;
    previousResponseId: z.ZodOptional<z.ZodString>;
    trace: z.ZodNullable<z.ZodObject<{
        object: z.ZodLiteral<"trace">;
        id: z.ZodString;
        workflow_name: z.ZodString;
        group_id: z.ZodNullable<z.ZodString>;
        metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
        tracing_api_key: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type FinalOutputSource = 'error_handler' | 'turn_resolution';
/**
 * Serializable snapshot of an agent's run, including context, usage and trace.
 * While this class has publicly writable properties (prefixed with `_`), they are not meant to be
 * used directly. To read these properties, use the `RunResult` instead.
 *
 * Manipulation of the state directly can lead to unexpected behavior and should be avoided.
 * Instead, use the `approve` and `reject` methods to interact with the state.
 */
export declare class RunState<TContext, TAgent extends Agent<any, any>> {
    /**
     * Current turn number in the conversation.
     */
    _currentTurn: number;
    /**
     * Whether the current turn has already been counted (useful when resuming mid-turn).
     */
    _currentTurnInProgress: boolean;
    /**
     * The agent currently handling the conversation.
     */
    _currentAgent: TAgent;
    /**
     * Original user input prior to any processing.
     */
    _originalInput: string | AgentInputItem[];
    /**
     * Responses from the model so far.
     */
    _modelResponses: ModelResponse[];
    /**
     * Conversation identifier when the server manages conversation history.
     */
    _conversationId: string | undefined;
    /**
     * Latest response identifier returned by the server for server-managed conversations.
     */
    _previousResponseId: string | undefined;
    /**
     * Effective model settings used for the most recent model call.
     */
    _lastModelSettings: ModelSettings | undefined;
    /**
     * Active tracing span for the current agent if tracing is enabled.
     */
    _currentAgentSpan: Span<AgentSpanData> | undefined;
    /**
     * Run context tracking approvals, usage, and other metadata.
     */
    _context: RunContext<TContext>;
    /**
     * The usage aggregated for this run. This includes per-request breakdowns when available.
     */
    get usage(): Usage;
    /**
     * Tracks what tools each agent has used.
     */
    _toolUseTracker: AgentToolUseTracker;
    /**
     * Items generated by the agent during the run.
     */
    _generatedItems: RunItem[];
    /**
     * Number of `_generatedItems` already flushed to session storage for the current turn.
     *
     * Persisting the entire turn on every save would duplicate responses and tool outputs.
     * Instead, `saveToSession` appends only the delta since the previous write. This counter
     * tracks how many generated run items from *this turn* were already written so the next
     * save can slice off only the new entries. When a turn is interrupted (e.g., awaiting tool
     * approval) and later resumed, we rewind the counter before continuing so the pending tool
     * output still gets stored.
     */
    _currentTurnPersistedItemCount: number;
    /**
     * Maximum allowed turns before forcing termination.
     */
    _maxTurns: number;
    /**
     * Whether the run has an active agent step in progress.
     */
    _noActiveAgentRun: boolean;
    /**
     * Last model response for the previous turn.
     */
    _lastTurnResponse: ModelResponse | undefined;
    /**
     * Results from input guardrails applied to the run.
     */
    _inputGuardrailResults: InputGuardrailResult[];
    /**
     * Results from output guardrails applied to the run.
     */
    _outputGuardrailResults: OutputGuardrailResult<any, any>[];
    /**
     * Results from tool input guardrails applied during tool execution.
     */
    _toolInputGuardrailResults: ToolInputGuardrailResult[];
    /**
     * Results from tool output guardrails applied during tool execution.
     */
    _toolOutputGuardrailResults: ToolOutputGuardrailResult[];
    /**
     * Next step computed for the agent to take.
     */
    _currentStep: NextStep | undefined;
    /**
     * Indicates how the final output was produced for the current run.
     * This value is not serialized.
     */
    _finalOutputSource: FinalOutputSource | undefined;
    /**
     * Parsed model response after applying guardrails and tools.
     */
    _lastProcessedResponse: ProcessedResponse<TContext> | undefined;
    /**
     * Trace associated with this run if tracing is enabled.
     */
    _trace: Trace | null;
    constructor(context: RunContext<TContext>, originalInput: string | AgentInputItem[], startingAgent: TAgent, maxTurns: number);
    /**
     * Updates server-managed conversation identifiers as a single operation.
     */
    setConversationContext(conversationId?: string, previousResponseId?: string): void;
    /**
     * Updates the agent span associated with the current run.
     */
    setCurrentAgentSpan(span?: Span<AgentSpanData>): void;
    /**
     * Switches the active agent handling the run.
     */
    setCurrentAgent(agent: TAgent): void;
    /**
     * Returns the agent currently handling the run.
     */
    get currentAgent(): TAgent;
    /**
     * Resets the counter that tracks how many items were persisted for the current turn.
     */
    resetTurnPersistence(): void;
    /**
     * Rewinds the persisted item counter when pending approvals require re-writing outputs.
     */
    rewindTurnPersistence(count: number): void;
    /**
     * The history of the agent run. This includes the input items and the new items generated during the run.
     *
     * This can be used as inputs for the next agent run.
     */
    get history(): AgentInputItem[];
    /**
     * Returns all interruptions if the current step is an interruption otherwise returns an empty array.
     */
    getInterruptions(): any;
    /**
     * Approves a tool call requested by the agent through an interruption and approval item request.
     *
     * To approve the request use this method and then run the agent again with the same state object
     * to continue the execution.
     *
     * By default it will only approve the current tool call. To allow the tool to be used multiple
     * times throughout the run, set the `alwaysApprove` option to `true`.
     *
     * @param approvalItem - The tool call approval item to approve.
     * @param options - Options for the approval.
     */
    approve(approvalItem: RunToolApprovalItem, options?: {
        alwaysApprove?: boolean;
    }): void;
    /**
     * Rejects a tool call requested by the agent through an interruption and approval item request.
     *
     * To reject the request use this method and then run the agent again with the same state object
     * to continue the execution.
     *
     * By default it will only reject the current tool call. To allow the tool to be used multiple
     * times throughout the run, set the `alwaysReject` option to `true`.
     *
     * @param approvalItem - The tool call approval item to reject.
     * @param options - Options for the rejection.
     */
    reject(approvalItem: RunToolApprovalItem, options?: {
        alwaysReject?: boolean;
    }): void;
    /**
     * Serializes the run state to a JSON object.
     *
     * This method is used to serialize the run state to a JSON object that can be used to
     * resume the run later.
     *
     * @returns The serialized run state.
     */
    /**
     * Serializes the run state. By default, tracing API keys are omitted to prevent
     * accidental persistence of secrets. Pass `includeTracingApiKey: true` only when you
     * intentionally need to migrate a run along with its tracing credentials (e.g., to
     * rehydrate in a separate process that lacks the original environment variables).
     */
    toJSON(options?: {
        includeTracingApiKey?: boolean;
    }): z.infer<typeof SerializedRunState>;
    /**
     * Serializes the run state to a string.
     *
     * This method is used to serialize the run state to a string that can be used to
     * resume the run later.
     *
     * @returns The serialized run state.
     */
    toString(options?: {
        includeTracingApiKey?: boolean;
    }): string;
    /**
     * Deserializes a run state from a string.
     *
     * This method is used to deserialize a run state from a string that was serialized using the
     * `toString` method.
     */
    static fromString<TContext, TAgent extends Agent<any, any>>(initialAgent: TAgent, str: string): Promise<RunState<TContext, TAgent>>;
}
export {};

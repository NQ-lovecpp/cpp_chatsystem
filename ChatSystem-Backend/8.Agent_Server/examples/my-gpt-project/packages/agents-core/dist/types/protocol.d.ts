import { z } from 'zod';
/**
 * Every item in the protocol provides a `providerData` field to accommodate custom functionality
 * or new fields
 */
export declare const SharedBase: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type SharedBase = z.infer<typeof SharedBase>;
/**
 * Every item has a shared of shared item data including an optional ID.
 */
export declare const ItemBase: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ItemBase = z.infer<typeof ItemBase>;
export declare const Refusal: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"refusal">;
    refusal: z.ZodString;
}, z.core.$strip>;
export type Refusal = z.infer<typeof Refusal>;
export declare const OutputText: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"output_text">;
    text: z.ZodString;
}, z.core.$strip>;
export type OutputText = z.infer<typeof OutputText>;
export declare const InputText: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"input_text">;
    text: z.ZodString;
}, z.core.$strip>;
export type InputText = z.infer<typeof InputText>;
export declare const ReasoningText: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"reasoning_text">;
    text: z.ZodString;
}, z.core.$strip>;
export type ReasoningText = z.infer<typeof ReasoningText>;
export declare const InputImage: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"input_image">;
    image: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>>;
    detail: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InputImage = z.infer<typeof InputImage>;
export declare const InputFile: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"input_file">;
    file: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, z.ZodObject<{
        url: z.ZodString;
    }, z.core.$strip>]>>;
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InputFile = z.infer<typeof InputFile>;
export declare const AudioContent: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"audio">;
    audio: z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>;
    format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    transcript: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type AudioContent = z.infer<typeof AudioContent>;
export declare const ImageContent: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"image">;
    image: z.ZodString;
}, z.core.$strip>;
export type ImageContent = z.infer<typeof ImageContent>;
export declare const ToolOutputText: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>;
export type ToolOutputText = z.infer<typeof ToolOutputText>;
export declare const ToolOutputImage: z.ZodObject<{
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
}, z.core.$strip>;
export type ToolOutputImage = z.infer<typeof ToolOutputImage>;
export declare const ToolOutputFileContent: z.ZodObject<{
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
}, z.core.$strip>;
export type ToolOutputFileContent = z.infer<typeof ToolOutputFileContent>;
export declare const ComputerToolOutput: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"computer_screenshot">;
    data: z.ZodString;
}, z.core.$strip>;
export type ComputerToolOutput = z.infer<typeof ComputerToolOutput>;
export declare const computerActions: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ComputerAction = z.infer<typeof computerActions>;
export declare const AssistantContent: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type AssistantContent = z.infer<typeof AssistantContent>;
export declare const AssistantMessageItem: z.ZodObject<{
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
export type AssistantMessageItem = z.infer<typeof AssistantMessageItem>;
export declare const UserContent: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type UserContent = z.infer<typeof UserContent>;
export declare const UserMessageItem: z.ZodObject<{
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
}, z.core.$strip>;
export type UserMessageItem = z.infer<typeof UserMessageItem>;
declare const SystemMessageItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodLiteral<"message">>;
    role: z.ZodLiteral<"system">;
    content: z.ZodString;
}, z.core.$strip>;
export type SystemMessageItem = z.infer<typeof SystemMessageItem>;
export declare const MessageItem: z.ZodDiscriminatedUnion<[z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodLiteral<"message">>;
    role: z.ZodLiteral<"system">;
    content: z.ZodString;
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
}, z.core.$strip>], "role">;
export type MessageItem = z.infer<typeof MessageItem>;
export declare const HostedToolCallItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"hosted_tool_call">;
    name: z.ZodString;
    arguments: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    output: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type HostedToolCallItem = z.infer<typeof HostedToolCallItem>;
export declare const FunctionCallItem: z.ZodObject<{
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
export type FunctionCallItem = z.infer<typeof FunctionCallItem>;
export declare const ToolCallOutputContent: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type ToolCallOutputContent = z.infer<typeof ToolCallOutputContent>;
export declare const ToolCallStructuredOutput: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type ToolCallStructuredOutput = z.infer<typeof ToolCallStructuredOutput>;
export declare const FunctionCallResultItem: z.ZodObject<{
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
export type FunctionCallResultItem = z.infer<typeof FunctionCallResultItem>;
export declare const ComputerUseCallItem: z.ZodObject<{
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
}, z.core.$strip>;
export type ComputerUseCallItem = z.infer<typeof ComputerUseCallItem>;
export declare const ComputerCallResultItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"computer_call_result">;
    callId: z.ZodString;
    output: z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        type: z.ZodLiteral<"computer_screenshot">;
        data: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ComputerCallResultItem = z.infer<typeof ComputerCallResultItem>;
export declare const ShellAction: z.ZodObject<{
    commands: z.ZodArray<z.ZodString>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
    maxOutputLength: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ShellAction = z.infer<typeof ShellAction>;
export declare const ShellCallItem: z.ZodObject<{
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
}, z.core.$strip>;
export type ShellCallItem = z.infer<typeof ShellCallItem>;
export declare const ShellCallOutcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"timeout">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"exit">;
    exitCode: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>], "type">;
export type ShellCallOutcome = z.infer<typeof ShellCallOutcome>;
export declare const ShellCallOutputContent: z.ZodObject<{
    stdout: z.ZodString;
    stderr: z.ZodString;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"timeout">;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"exit">;
        exitCode: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>], "type">;
}, z.core.$loose>;
export type ShellCallOutputContent = z.infer<typeof ShellCallOutputContent>;
export declare const ShellCallResultItem: z.ZodObject<{
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
}, z.core.$strip>;
export type ShellCallResultItem = z.infer<typeof ShellCallResultItem>;
export declare const ApplyPatchOperationCreateFile: z.ZodObject<{
    type: z.ZodLiteral<"create_file">;
    path: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>;
export type ApplyPatchOperationCreateFile = z.infer<typeof ApplyPatchOperationCreateFile>;
export declare const ApplyPatchOperationUpdateFile: z.ZodObject<{
    type: z.ZodLiteral<"update_file">;
    path: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>;
export type ApplyPatchOperationUpdateFile = z.infer<typeof ApplyPatchOperationUpdateFile>;
export declare const ApplyPatchOperationDeleteFile: z.ZodObject<{
    type: z.ZodLiteral<"delete_file">;
    path: z.ZodString;
}, z.core.$strip>;
export type ApplyPatchOperationDeleteFile = z.infer<typeof ApplyPatchOperationDeleteFile>;
export declare const ApplyPatchOperation: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ApplyPatchOperation = z.infer<typeof ApplyPatchOperation>;
export declare const ApplyPatchCallItem: z.ZodObject<{
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
}, z.core.$strip>;
export type ApplyPatchCallItem = z.infer<typeof ApplyPatchCallItem>;
export declare const ApplyPatchCallResultItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"apply_patch_call_output">;
    callId: z.ZodString;
    status: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
    }>;
    output: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApplyPatchCallResultItem = z.infer<typeof ApplyPatchCallResultItem>;
export declare const ToolCallItem: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type ToolCallItem = z.infer<typeof ToolCallItem>;
export declare const ReasoningItem: z.ZodObject<{
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
export type ReasoningItem = z.infer<typeof ReasoningItem>;
export declare const CompactionItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"compaction">;
    encrypted_content: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CompactionItem = z.infer<typeof CompactionItem>;
/**
 * This is a catch all for items that are not part of the protocol.
 *
 * For example, a model might return an item that is not part of the protocol using this type.
 *
 * In that case everything returned from the model should be passed in the `providerData` field.
 *
 * This enables new features to be added to be added by a model provider without breaking the protocol.
 */
export declare const UnknownItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"unknown">;
}, z.core.$strip>;
export type UnknownItem = z.infer<typeof UnknownItem>;
export declare const OutputModelItem: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strip>], "type">;
export type OutputModelItem = z.infer<typeof OutputModelItem>;
export declare const ModelItem: z.ZodUnion<readonly [z.ZodObject<{
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
}, z.core.$strip>]>;
export type ModelItem = z.infer<typeof ModelItem>;
export declare const RequestUsageData: z.ZodObject<{
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    inputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    outputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    endpoint: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RequestUsageData = z.infer<typeof RequestUsageData>;
export declare const UsageData: z.ZodObject<{
    requests: z.ZodOptional<z.ZodNumber>;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    inputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
    outputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
    requestUsageEntries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        totalTokens: z.ZodNumber;
        inputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        outputTokensDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        endpoint: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type UsageData = z.infer<typeof UsageData>;
/**
 * Event returned by the model when new output text is available to stream to the user.
 */
export declare const StreamEventTextStream: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"output_text_delta">;
    delta: z.ZodString;
}, z.core.$strip>;
export type StreamEventTextStream = z.infer<typeof StreamEventTextStream>;
/**
 * Event returned by the model when a new response is started.
 */
export declare const StreamEventResponseStarted: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"response_started">;
}, z.core.$strip>;
export type StreamEventResponseStarted = z.infer<typeof StreamEventResponseStarted>;
/**
 * Event returned by the model when a response is completed.
 */
export declare const StreamEventResponseCompleted: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"response_done">;
    response: z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodString;
        usage: z.ZodObject<{
            requests: z.ZodOptional<z.ZodNumber>;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            totalTokens: z.ZodNumber;
            inputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
            outputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
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
    }, z.core.$strip>;
}, z.core.$strip>;
export type StreamEventResponseCompleted = z.infer<typeof StreamEventResponseCompleted>;
/**
 * Event returned for every item that gets streamed to the model. Used to expose the raw events
 * from the model.
 */
export declare const StreamEventGenericItem: z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"model">;
    event: z.ZodAny;
}, z.core.$strip>;
export type StreamEventGenericItem = z.infer<typeof StreamEventGenericItem>;
export declare const StreamEvent: z.ZodDiscriminatedUnion<[z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"output_text_delta">;
    delta: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"response_done">;
    response: z.ZodObject<{
        providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        id: z.ZodString;
        usage: z.ZodObject<{
            requests: z.ZodOptional<z.ZodNumber>;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            totalTokens: z.ZodNumber;
            inputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
            outputTokensDetails: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodNumber>>]>>;
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
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"response_started">;
}, z.core.$strip>, z.ZodObject<{
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    type: z.ZodLiteral<"model">;
    event: z.ZodAny;
}, z.core.$strip>], "type">;
export type StreamEvent = StreamEventTextStream | StreamEventResponseCompleted | StreamEventResponseStarted | StreamEventGenericItem;
export {};

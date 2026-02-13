import { Agent } from './agent';
import * as protocol from './types/protocol';
export declare class RunItemBase {
    readonly type: string;
    rawItem?: protocol.ModelItem;
    toJSON(): {
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunMessageOutputItem extends RunItemBase {
    rawItem: protocol.AssistantMessageItem;
    agent: Agent;
    readonly type: "message_output_item";
    constructor(rawItem: protocol.AssistantMessageItem, agent: Agent);
    toJSON(): {
        agent: {
            name: string;
        };
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
    get content(): string;
}
export declare class RunToolCallItem extends RunItemBase {
    rawItem: protocol.ToolCallItem;
    agent: Agent;
    readonly type: "tool_call_item";
    constructor(rawItem: protocol.ToolCallItem, agent: Agent);
    toJSON(): {
        agent: {
            name: string;
        };
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunToolCallOutputItem extends RunItemBase {
    rawItem: protocol.FunctionCallResultItem | protocol.ComputerCallResultItem | protocol.ShellCallResultItem | protocol.ApplyPatchCallResultItem;
    agent: Agent<any, any>;
    output: string | unknown;
    readonly type: "tool_call_output_item";
    constructor(rawItem: protocol.FunctionCallResultItem | protocol.ComputerCallResultItem | protocol.ShellCallResultItem | protocol.ApplyPatchCallResultItem, agent: Agent<any, any>, output: string | unknown);
    toJSON(): {
        agent: {
            name: string;
        };
        output: string;
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunReasoningItem extends RunItemBase {
    rawItem: protocol.ReasoningItem;
    agent: Agent;
    readonly type: "reasoning_item";
    constructor(rawItem: protocol.ReasoningItem, agent: Agent);
    toJSON(): {
        agent: {
            name: string;
        };
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunHandoffCallItem extends RunItemBase {
    rawItem: protocol.FunctionCallItem;
    agent: Agent;
    readonly type: "handoff_call_item";
    constructor(rawItem: protocol.FunctionCallItem, agent: Agent);
    toJSON(): {
        agent: {
            name: string;
        };
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunHandoffOutputItem extends RunItemBase {
    rawItem: protocol.FunctionCallResultItem;
    sourceAgent: Agent<any, any>;
    targetAgent: Agent<any, any>;
    readonly type: "handoff_output_item";
    constructor(rawItem: protocol.FunctionCallResultItem, sourceAgent: Agent<any, any>, targetAgent: Agent<any, any>);
    toJSON(): {
        sourceAgent: {
            name: string;
        };
        targetAgent: {
            name: string;
        };
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export declare class RunToolApprovalItem extends RunItemBase {
    rawItem: protocol.FunctionCallItem | protocol.HostedToolCallItem | protocol.ShellCallItem | protocol.ApplyPatchCallItem;
    agent: Agent<any, any>;
    /**
     * Explicit tool name to use for approval tracking when not present on the raw item.
     */
    toolName?: string | undefined;
    readonly type: "tool_approval_item";
    constructor(rawItem: protocol.FunctionCallItem | protocol.HostedToolCallItem | protocol.ShellCallItem | protocol.ApplyPatchCallItem, agent: Agent<any, any>, 
    /**
     * Explicit tool name to use for approval tracking when not present on the raw item.
     */
    toolName?: string | undefined);
    /**
     * Returns the tool name if available on the raw item or provided explicitly.
     * Kept for backwards compatibility with code that previously relied on `rawItem.name`.
     */
    get name(): string | undefined;
    /**
     * Returns the arguments if the raw item has an arguments property otherwise this will be undefined.
     */
    get arguments(): string | undefined;
    toJSON(): {
        agent: {
            name: string;
        };
        toolName: string | undefined;
        type: string;
        rawItem: {
            role: "assistant";
            status: "in_progress" | "completed" | "incomplete";
            content: ({
                type: "refusal";
                refusal: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "output_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            } | {
                type: "image";
                image: string;
                providerData?: Record<string, any> | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "user";
            content: string | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            } | {
                type: "audio";
                audio: string | {
                    id: string;
                };
                providerData?: Record<string, any> | undefined;
                format?: string | null | undefined;
                transcript?: string | null | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            role: "system";
            content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            type?: "message" | undefined;
        } | {
            type: "hosted_tool_call";
            name: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            arguments?: string | undefined;
            status?: string | undefined;
            output?: string | undefined;
        } | {
            type: "function_call";
            callId: string;
            name: string;
            arguments: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "function_call_result";
            name: string;
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            output: string | {
                type: "text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType?: string | undefined;
                } | {
                    url: string;
                } | {
                    fileId: string;
                } | undefined;
                detail?: "low" | "high" | "auto" | (string & {}) | undefined;
            } | {
                type: "file";
                file: string | {
                    data: string | Uint8Array<ArrayBuffer>;
                    mediaType: string;
                    filename: string;
                } | {
                    url: string;
                    filename?: string | undefined;
                } | {
                    id: string;
                    filename?: string | undefined;
                };
                providerData?: Record<string, any> | undefined;
            } | ({
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            } | {
                type: "input_image";
                providerData?: Record<string, any> | undefined;
                image?: string | {
                    id: string;
                } | undefined;
                detail?: string | undefined;
            } | {
                type: "input_file";
                providerData?: Record<string, any> | undefined;
                file?: string | {
                    id: string;
                } | {
                    url: string;
                } | undefined;
                filename?: string | undefined;
            })[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call";
            callId: string;
            status: "in_progress" | "completed" | "incomplete";
            action: {
                type: "screenshot";
            } | {
                type: "click";
                x: number;
                y: number;
                button: "left" | "right" | "wheel" | "back" | "forward";
            } | {
                type: "double_click";
                x: number;
                y: number;
            } | {
                type: "scroll";
                x: number;
                y: number;
                scroll_x: number;
                scroll_y: number;
            } | {
                type: "type";
                text: string;
            } | {
                type: "wait";
            } | {
                type: "move";
                x: number;
                y: number;
            } | {
                type: "keypress";
                keys: string[];
            } | {
                type: "drag";
                path: {
                    x: number;
                    y: number;
                }[];
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "computer_call_result";
            callId: string;
            output: {
                type: "computer_screenshot";
                data: string;
                providerData?: Record<string, any> | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "shell_call";
            callId: string;
            action: {
                commands: string[];
                timeoutMs?: number | undefined;
                maxOutputLength?: number | undefined;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            status?: "in_progress" | "completed" | "incomplete" | undefined;
        } | {
            type: "shell_call_output";
            callId: string;
            output: {
                [x: string]: unknown;
                stdout: string;
                stderr: string;
                outcome: {
                    type: "timeout";
                } | {
                    type: "exit";
                    exitCode: number | null;
                };
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            maxOutputLength?: number | undefined;
        } | {
            type: "apply_patch_call";
            callId: string;
            status: "in_progress" | "completed";
            operation: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | {
            type: "apply_patch_call_output";
            callId: string;
            status: "completed" | "failed";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            output?: string | undefined;
        } | {
            type: "reasoning";
            content: {
                type: "input_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[];
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            rawContent?: {
                type: "reasoning_text";
                text: string;
                providerData?: Record<string, any> | undefined;
            }[] | undefined;
        } | {
            type: "compaction";
            encrypted_content: string;
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
            created_by?: string | undefined;
        } | {
            type: "unknown";
            providerData?: Record<string, any> | undefined;
            id?: string | undefined;
        } | undefined;
    };
}
export type RunItem = RunMessageOutputItem | RunToolCallItem | RunReasoningItem | RunHandoffCallItem | RunToolCallOutputItem | RunHandoffOutputItem | RunToolApprovalItem;
/**
 * Extract all text output from a list of run items by concatenating the content of all
 * message output items.
 *
 * @param items - The list of run items to extract text from.
 * @returns A string of all the text output from the run items.
 */
export declare function extractAllTextOutput(items: RunItem[]): string;

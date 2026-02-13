import { JsonObjectSchema, ModelSettingsToolChoice, Prompt } from '@openai/agents-core/types';
export type RealtimeClientMessage = {
    type: string;
    [key: string]: any;
};
export type RealtimeUserInput = string | {
    type: 'message';
    role: 'user';
    content: ({
        type: 'input_text';
        text: string;
    } | {
        type: 'input_image';
        image: string;
        providerData?: Record<string, any>;
    })[];
};
export type RealtimeAudioFormatDefinition = {
    type: 'audio/pcm';
    rate: number;
} | {
    type: 'audio/pcmu';
} | {
    type: 'audio/pcma';
};
/**
 * @deprecated Use a {type: "audio/pcm"} format instead. String shorthands are deprecated.
 */
export type RealtimeAudioFormatLegacy = 'pcm16' | 'g711_ulaw' | 'g711_alaw' | (string & {});
export type RealtimeAudioFormat = RealtimeAudioFormatLegacy | RealtimeAudioFormatDefinition;
export type RealtimeTracingConfig = {
    workflow_name?: string;
    group_id?: string;
    metadata?: Record<string, any>;
} | 'auto';
export type RealtimeInputAudioNoiseReductionConfig = {
    type: 'near_field' | 'far_field' | (string & {});
};
export type RealtimeInputAudioTranscriptionConfig = {
    language?: string;
    model?: 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe' | 'whisper-1' | (string & {});
    prompt?: string;
};
export type RealtimeTurnDetectionConfigAsIs = {
    type?: 'semantic_vad' | 'server_vad' | (string & {});
    create_response?: boolean;
    eagerness?: 'auto' | 'low' | 'medium' | 'high';
    interrupt_response?: boolean;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
    threshold?: number;
    idle_timeout_ms?: number;
};
export type RealtimeTurnDetectionConfigCamelCase = {
    type?: 'semantic_vad' | 'server_vad' | (string & {});
    createResponse?: boolean;
    eagerness?: 'auto' | 'low' | 'medium' | 'high';
    interruptResponse?: boolean;
    prefixPaddingMs?: number;
    silenceDurationMs?: number;
    threshold?: number;
    idleTimeoutMs?: number;
};
export type RealtimeTurnDetectionConfig = (RealtimeTurnDetectionConfigAsIs | RealtimeTurnDetectionConfigCamelCase) & Record<string, any>;
export type RealtimeAudioInputConfig = {
    format?: RealtimeAudioFormat;
    noiseReduction?: RealtimeInputAudioNoiseReductionConfig | null;
    transcription?: RealtimeInputAudioTranscriptionConfig | null;
    turnDetection?: RealtimeTurnDetectionConfig | null;
};
export type RealtimeAudioOutputConfig = {
    format?: RealtimeAudioFormat;
    voice?: string;
    speed?: number;
};
export type RealtimeAudioConfig = {
    input?: RealtimeAudioInputConfig;
    output?: RealtimeAudioOutputConfig;
};
export type RealtimeSessionConfigCommon = {
    model: string;
    instructions: string;
    toolChoice: ModelSettingsToolChoice;
    tools: RealtimeToolDefinition[];
    tracing?: RealtimeTracingConfig | null;
    providerData?: Record<string, any>;
    prompt?: Prompt;
};
export type RealtimeSessionConfigDefinition = RealtimeSessionConfigCommon & {
    outputModalities?: ('text' | 'audio')[];
    audio?: RealtimeAudioConfig;
    /**
     * TODO: We'll eventually migrate to audio.output.voice instead of this property.
     * Until we fully migrate to audio.output.voice for all session implementations,
     * using this top-level voice property helps with backwards compatibility.
     */
    voice?: string;
};
export type RealtimeSessionConfigDeprecated = RealtimeSessionConfigCommon & {
    /** @deprecated Use outputModalities instead. */
    modalities: ('text' | 'audio')[];
    /** @deprecated Use audio.output.voice instead. */
    voice: string;
    /** @deprecated Use audio.input.format instead. */
    inputAudioFormat: RealtimeAudioFormatLegacy;
    /** @deprecated Use audio.output.format instead. */
    outputAudioFormat: RealtimeAudioFormatLegacy;
    /** @deprecated Use audio.input.transcription instead. */
    inputAudioTranscription: RealtimeInputAudioTranscriptionConfig;
    /** @deprecated Use audio.input.turnDetection instead. */
    turnDetection: RealtimeTurnDetectionConfig;
    /** @deprecated Use audio.input.noiseReduction instead. */
    inputAudioNoiseReduction: RealtimeInputAudioNoiseReductionConfig | null;
    /** @deprecated Use audio.output.speed instead. */
    speed: number;
};
export type RealtimeSessionConfig = RealtimeSessionConfigDefinition | RealtimeSessionConfigDeprecated;
/**
 * Convert any given config (old or new) to the new GA config shape.
 * If a new config is provided, it will be returned as-is (normalized shallowly).
 */
export declare function toNewSessionConfig(config: Partial<RealtimeSessionConfig>): Partial<RealtimeSessionConfigDefinition>;
export declare function normalizeAudioFormat(format?: RealtimeAudioFormat | undefined): RealtimeAudioFormatDefinition | undefined;
export type FunctionToolDefinition = {
    type: 'function';
    name: string;
    description: string;
    parameters: JsonObjectSchema<any>;
    strict: boolean;
};
export type HostedToolFilter = {
    tool_names?: string[];
};
export type HostedMCPToolDefinition = {
    type: 'mcp';
    server_label: string;
    server_url?: string;
    headers?: Record<string, string>;
    allowed_tools?: string[] | HostedToolFilter;
    require_approval?: 'never' | 'always' | {
        never?: HostedToolFilter;
        always?: HostedToolFilter;
    };
};
export type RealtimeToolDefinition = FunctionToolDefinition | HostedMCPToolDefinition;
export type RealtimeMcpToolInfo = {
    name: string;
    description?: string;
    input_schema?: Record<string, any>;
    [key: string]: any;
};

import { FunctionTool, HostedMCPTool, Tool } from '@openai/agents-core';
import { RealtimeToolDefinition } from './clientMessages';
export declare const BACKGROUND_RESULT_SYMBOL: unique symbol;
type BackgroundResult<T> = {
    [BACKGROUND_RESULT_SYMBOL]: true;
    content: T;
};
export declare function backgroundResult<T>(content: T): BackgroundResult<T>;
export declare function isBackgroundResult<T>(result: unknown): result is BackgroundResult<T>;
export type RealtimeTool = FunctionTool<any> | HostedMCPTool<any>;
export declare function isValidRealtimeTool(tool: Tool<any>): tool is RealtimeTool;
export declare function toRealtimeToolDefinition(tool: RealtimeTool): RealtimeToolDefinition;
export {};

import { Agent } from '../agent';
import { Handoff } from '../handoff';
import { ModelTracing } from '../model';
import { Tool } from '../tool';
import { createAgentSpan } from '../tracing';
import { Span } from '../tracing/spans';
import { Trace } from '../tracing/traces';
export type TraceOverrideConfig = {
    traceId?: string;
    workflowName?: string;
    groupId?: string;
    traceMetadata?: Record<string, any>;
    tracingApiKey?: string;
};
type EnsureAgentSpanParams<TContext> = {
    agent: Agent<TContext, any>;
    handoffs: Handoff<any, any>[];
    tools: Tool<TContext>[];
    currentSpan?: ReturnType<typeof createAgentSpan>;
};
/**
 * Normalizes tracing configuration into the format expected by model providers.
 * Returns `false` to disable tracing, `true` to include full payload data, or
 * `'enabled_without_data'` to omit sensitive content while still emitting spans.
 */
export declare function getTracing(tracingDisabled: boolean, traceIncludeSensitiveData: boolean): ModelTracing;
export declare function applyTraceOverrides(trace: Trace, currentSpan: Span<any> | undefined, overrides: TraceOverrideConfig): {
    trace: Trace;
    currentSpan: Span<any> | undefined;
};
/**
 * Ensures an agent span exists and updates tool metadata if already present.
 * Returns the span so callers can pass it through run state.
 */
export declare function ensureAgentSpan<TContext>(params: EnsureAgentSpanParams<TContext>): Span<import("../tracing").AgentSpanData>;
export {};

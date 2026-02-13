import { RealtimeItem, RealtimeMcpCallApprovalRequestItem, RealtimeMessageItem } from './items';
import type { InputAudioTranscriptionCompletedEvent } from './transportLayerEvents';
import { RunToolApprovalItem } from '@openai/agents-core';
import { RealtimeAgent } from './realtimeAgent';
/**
 * Converts a base64 string to an ArrayBuffer
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Converts an ArrayBuffer to a base64 string
 * @param {ArrayBuffer} arrayBuffer
 * @returns {string}
 */
export declare function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string;
/**
 * Get the last text from an audio output message
 * @param item
 * @returns
 */
export declare function getLastTextFromAudioOutputMessage(item: unknown): string | undefined;
export type RealtimeHistoryDiff = {
    removals: RealtimeItem[];
    additions: RealtimeItem[];
    updates: RealtimeItem[];
};
/**
 * Compare two conversation histories to determine the removals, additions, and updates.
 * @param oldHistory - The old history.
 * @param newHistory - The new history.
 * @returns A diff of the two histories.
 */
export declare function diffRealtimeHistory(oldHistory: RealtimeItem[], newHistory: RealtimeItem[]): RealtimeHistoryDiff;
/**
 * Check if the browser supports WebRTC.
 * @returns True if WebRTC is supported, false otherwise.
 */
export declare function hasWebRTCSupport(): boolean;
/**
 * Removes the audio data from all content in a message by setting it to null.
 * @param item
 * @returns
 */
export declare function removeAudioFromContent(item: RealtimeMessageItem): RealtimeMessageItem;
/**
 * Updates the realtime history array based on the incoming event and options.
 * @param history - The current history array.
 * @param event - The event to process (RealtimeItem).
 * @param shouldIncludeAudioData - Whether to include audio data in message items.
 * @returns The updated history array.
 */
export declare function updateRealtimeHistory(history: RealtimeItem[], event: RealtimeItem | InputAudioTranscriptionCompletedEvent, shouldIncludeAudioData: boolean): RealtimeItem[];
/**
 * The headers to use for the Realtime API.
 */
export declare const HEADERS: {
    'User-Agent': string;
    'X-OpenAI-Agents-SDK': string;
};
/**
 * Browser websocket header
 */
export declare const WEBSOCKET_META: string;
export declare function realtimeApprovalItemToApprovalItem(agent: RealtimeAgent<any>, item: RealtimeMcpCallApprovalRequestItem): RunToolApprovalItem;
export declare function approvalItemToRealtimeApprovalItem(item: RunToolApprovalItem): RealtimeMcpCallApprovalRequestItem;

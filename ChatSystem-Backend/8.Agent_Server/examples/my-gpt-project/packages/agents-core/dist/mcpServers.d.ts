import type { MCPServer } from './mcp';
export type MCPServersOptions = {
    connectTimeoutMs?: number | null;
    closeTimeoutMs?: number | null;
    dropFailed?: boolean;
    strict?: boolean;
    suppressAbortError?: boolean;
    connectInParallel?: boolean;
};
export type MCPServersReconnectOptions = {
    failedOnly?: boolean;
};
/**
 * Manages MCP server lifecycle and exposes only connected servers.
 */
export declare class MCPServers {
    private readonly allServers;
    private activeServers;
    private failedServers;
    private failedServerSet;
    private errorsByServer;
    private suppressedAbortFailures;
    private workers;
    private readonly connectTimeoutMs;
    private readonly closeTimeoutMs;
    private readonly dropFailed;
    private readonly strict;
    private readonly suppressAbortError;
    private readonly connectInParallel;
    [Symbol.asyncDispose]: () => Promise<void>;
    private constructor();
    static open(servers: MCPServer[], options?: MCPServersOptions): Promise<MCPServers>;
    get all(): MCPServer[];
    get active(): MCPServer[];
    get failed(): MCPServer[];
    get errors(): ReadonlyMap<MCPServer, Error>;
    reconnect(options?: MCPServersReconnectOptions): Promise<MCPServer[]>;
    close(): Promise<void>;
    private connectAll;
    private closeAll;
    private attemptConnect;
    private refreshActiveServers;
    private recordFailure;
    private runConnect;
    private closeServer;
    private runClose;
    private closeServers;
    private connectAllParallel;
    private getWorker;
    private removeFailedServer;
}
/**
 * Connect to multiple MCP servers and return a managed MCPServers instance.
 */
export declare function connectMcpServers(servers: MCPServer[], options?: MCPServersOptions): Promise<MCPServers>;

"use strict";
/// <reference lib="dom" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocketProtocols = exports.WebSocket = void 0;
exports.isBrowserEnvironment = isBrowserEnvironment;
exports.WebSocket = globalThis.WebSocket;
function isBrowserEnvironment() {
    return true;
}
exports.useWebSocketProtocols = true;
//# sourceMappingURL=shims-browser.js.map
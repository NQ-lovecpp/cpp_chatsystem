"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocketProtocols = exports.WebSocket = void 0;
exports.isBrowserEnvironment = isBrowserEnvironment;
exports.WebSocket = globalThis.WebSocket;
function isBrowserEnvironment() {
    return false;
}
exports.useWebSocketProtocols = true;
//# sourceMappingURL=shims-workerd.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocketProtocols = exports.WebSocket = void 0;
exports.isBrowserEnvironment = isBrowserEnvironment;
var ws_1 = require("ws");
Object.defineProperty(exports, "WebSocket", { enumerable: true, get: function () { return ws_1.WebSocket; } });
function isBrowserEnvironment() {
    return false;
}
exports.useWebSocketProtocols = false;
//# sourceMappingURL=shims-node.js.map
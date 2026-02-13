"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBackgroundResult = exports.backgroundResult = exports.UserError = exports.tool = exports.OutputGuardrailTripwireTriggered = exports.ModelBehaviorError = exports.utils = exports.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG = exports.DEFAULT_OPENAI_REALTIME_MODEL = exports.OpenAIRealtimeBase = exports.OpenAIRealtimeSIP = exports.OpenAIRealtimeWebSocket = exports.OpenAIRealtimeWebRTC = exports.RealtimeSession = exports.RealtimeAgent = void 0;
const utilImport = __importStar(require("./utils.js"));
var realtimeAgent_1 = require("./realtimeAgent.js");
Object.defineProperty(exports, "RealtimeAgent", { enumerable: true, get: function () { return realtimeAgent_1.RealtimeAgent; } });
var realtimeSession_1 = require("./realtimeSession.js");
Object.defineProperty(exports, "RealtimeSession", { enumerable: true, get: function () { return realtimeSession_1.RealtimeSession; } });
var openaiRealtimeWebRtc_1 = require("./openaiRealtimeWebRtc.js");
Object.defineProperty(exports, "OpenAIRealtimeWebRTC", { enumerable: true, get: function () { return openaiRealtimeWebRtc_1.OpenAIRealtimeWebRTC; } });
var openaiRealtimeWebsocket_1 = require("./openaiRealtimeWebsocket.js");
Object.defineProperty(exports, "OpenAIRealtimeWebSocket", { enumerable: true, get: function () { return openaiRealtimeWebsocket_1.OpenAIRealtimeWebSocket; } });
var openaiRealtimeSip_1 = require("./openaiRealtimeSip.js");
Object.defineProperty(exports, "OpenAIRealtimeSIP", { enumerable: true, get: function () { return openaiRealtimeSip_1.OpenAIRealtimeSIP; } });
var openaiRealtimeBase_1 = require("./openaiRealtimeBase.js");
Object.defineProperty(exports, "OpenAIRealtimeBase", { enumerable: true, get: function () { return openaiRealtimeBase_1.OpenAIRealtimeBase; } });
Object.defineProperty(exports, "DEFAULT_OPENAI_REALTIME_MODEL", { enumerable: true, get: function () { return openaiRealtimeBase_1.DEFAULT_OPENAI_REALTIME_MODEL; } });
Object.defineProperty(exports, "DEFAULT_OPENAI_REALTIME_SESSION_CONFIG", { enumerable: true, get: function () { return openaiRealtimeBase_1.DEFAULT_OPENAI_REALTIME_SESSION_CONFIG; } });
exports.utils = {
    base64ToArrayBuffer: utilImport.base64ToArrayBuffer,
    arrayBufferToBase64: utilImport.arrayBufferToBase64,
    getLastTextFromAudioOutputMessage: utilImport.getLastTextFromAudioOutputMessage,
};
// Re-exporting some core functionalities requires for building front-end
// realtime agents
var agents_core_1 = require("@openai/agents-core");
Object.defineProperty(exports, "ModelBehaviorError", { enumerable: true, get: function () { return agents_core_1.ModelBehaviorError; } });
Object.defineProperty(exports, "OutputGuardrailTripwireTriggered", { enumerable: true, get: function () { return agents_core_1.OutputGuardrailTripwireTriggered; } });
Object.defineProperty(exports, "tool", { enumerable: true, get: function () { return agents_core_1.tool; } });
Object.defineProperty(exports, "UserError", { enumerable: true, get: function () { return agents_core_1.UserError; } });
var tool_1 = require("./tool.js");
Object.defineProperty(exports, "backgroundResult", { enumerable: true, get: function () { return tool_1.backgroundResult; } });
Object.defineProperty(exports, "isBackgroundResult", { enumerable: true, get: function () { return tool_1.isBackgroundResult; } });
//# sourceMappingURL=index.js.map
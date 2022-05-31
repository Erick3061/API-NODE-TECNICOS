"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./src/models/server"));
// configurar dotenv
exports.env = dotenv_1.default.config();
exports.server = new server_1.default();
exports.server.listen();
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool1 = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    user: process.env.DBTEC_USER || 'dev',
    password: process.env.DBTEC_PASSWORD || 'desarrollo',
    server: process.env.DBTEC_SERVER || 'localhost',
    database: process.env.DBTEC_DATABASE || 'TECNICOS',
    port: process.env.DBTEC_PORT ? parseInt(process.env.DBTEC_PORT) : 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
exports.pool1 = new mssql_1.default.ConnectionPool(config);
//# sourceMappingURL=connection.js.map
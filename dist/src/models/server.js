"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const connection_1 = require("../db/connection");
const admin_1 = __importDefault(require("../routes/admin"));
const auth_1 = __importDefault(require("../routes/auth"));
const sys_1 = __importDefault(require("../routes/sys"));
const files_1 = __importDefault(require("../routes/files"));
const fs_1 = __importDefault(require("fs"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
/*Servers */
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const task_1 = __importDefault(require("./task"));
class Server {
    constructor() {
        this.Con1 = false;
        this.Con2 = false;
        this.apiPaths = {
            adminRoutes: '/api/admin',
            authRoutes: '/api/auth',
            sysRoutes: '/api/sys',
            filesRoutes: '/api/files',
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3007';
        this.mode = process.env.NODE_ENV || 'desarrollo';
        this.server = (this.mode === 'desarrollo')
            ? http_1.default.createServer(this.app)
            : https_1.default.createServer({
                key: fs_1.default.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.key'),
                cert: fs_1.default.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.crt')
            }, this.app);
        this.middlewares();
        this.routes();
        this.connectDB(0);
    }
    connectDB(intent) {
        return __awaiter(this, void 0, void 0, function* () {
            connection_1.pool1.connect()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                this.Con1 = true;
                console.log('Conexion exitosa TECNICOS');
                yield this.coonectMW(0);
            }))
                .catch(() => {
                console.log('Error al conectar TECNICOS --> Reintentando conectar a TECNICOS...');
                if (intent < 5) {
                    setTimeout(() => this.connectDB(intent + 1), 3000);
                }
                else {
                    console.log('Se detuvo el proceso, no se pudo conectar a la base de datos');
                    process.exit(0);
                }
            });
        });
    }
    coonectMW(intent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.Con1)
                connection_1.pool2.connect()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    this.Con1 = true;
                    console.log('Conexion exitosa SISTEMA MW');
                    this.Task = new task_1.default();
                }))
                    .catch(() => {
                    console.log('Error al conectar SISTEMA MW --> Reintentando conectar a SISTEMA MW...');
                    if (intent < 5) {
                        setTimeout(() => this.coonectMW(intent + 1), 3000);
                    }
                    else {
                        console.log('Se detuvo el proceso, no se pudo conectar a la base de datos');
                        process.exit(0);
                    }
                });
        });
    }
    middlewares() {
        // CORS
        this.app.use((0, cors_1.default)());
        // Lectura body
        this.app.use(express_1.default.json());
        // Carpeta publica
        this.app.use(express_1.default.static('../public'));
        // Morgan
        this.app.use((0, morgan_1.default)("dev"));
        //File upload
        this.app.use((0, express_fileupload_1.default)({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }
    routes() {
        this.app.use(this.apiPaths.adminRoutes, admin_1.default);
        this.app.use(this.apiPaths.authRoutes, auth_1.default);
        this.app.use(this.apiPaths.sysRoutes, sys_1.default);
        this.app.use(this.apiPaths.filesRoutes, files_1.default);
    }
    listen() {
        console.log(this.mode);
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map
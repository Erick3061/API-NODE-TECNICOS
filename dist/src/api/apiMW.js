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
exports.apiMW = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const baseURL = process.env.APIMW || 'https://pem-sa.ddns.me:3018/monitoring';
/** @module API-MW */
/**
 * @description Metodo axios para obtener los datos de la Api - MW
 * @param {String} endpoint ruta de la la interfaz de programación de aplicación de Monitoring works
 * @param {Object} data Objeto si es una peticion POST
 * @param {String} method 'GET' | 'POST'
 * @returns {Object<{Promise<AxiosResponse<any, any>>}>}
 */
const apiMW = (endpoint, data = {}, method = 'GET') => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseURL}/${endpoint}`;
    console.log(url);
    const headers = {};
    Object.assign(headers, { 'Content-type': 'application/json' });
    return (method === 'GET') ? (0, axios_1.default)({ method, url }) : (0, axios_1.default)({ method, url, data });
});
exports.apiMW = apiMW;
exports.default = exports.apiMW;
//# sourceMappingURL=apiMW.js.map
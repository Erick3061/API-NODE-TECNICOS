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
exports.decodeJWT = exports.generarJWT = exports.SECRETORPPRIVATEKEY = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.SECRETORPPRIVATEKEY = 'P3Ms43zTP3Ms467P3Ms4mV54rIYP3MS4';
const generarJWT = (uid, role) => __awaiter(void 0, void 0, void 0, function* () {
    let expiresIn = (role === 1) ? '2h' : (role === 2) ? '12h' : (role === 3) ? '8h' : '10h';
    return yield new Promise((resolve, reject) => {
        const payload = { uid };
        const clave = exports.SECRETORPPRIVATEKEY;
        jsonwebtoken_1.default.sign(payload, clave, { expiresIn }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se generó el token');
            }
            else {
                resolve(token);
            }
        });
    })
        .then(resp => { return { token: `${resp}` }; })
        .catch(err => { return { error: `${err}` }; });
});
exports.generarJWT = generarJWT;
const decodeJWT = (token) => {
    const decode = jsonwebtoken_1.default.decode(token);
    if (decode !== null && typeof (decode) !== 'string')
        return decode;
};
exports.decodeJWT = decodeJWT;
//# sourceMappingURL=generar-jwt.js.map
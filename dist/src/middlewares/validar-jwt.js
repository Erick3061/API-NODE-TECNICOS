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
exports.validarJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorController_1 = require("../controller/errorController");
const generar_jwt_1 = require("../helpers/generar-jwt");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const validarJWT = (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('x-token');
    if (!token)
        return (0, errorController_1.rError)({ status: 401, msg: `No hay token en la petición`, location: 'validarJWT', resp });
    try {
        const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
        const decode = jsonwebtoken_1.default.verify(token, clave);
        if (typeof (decode) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: decode, location: 'validarJWT', resp });
        const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: decode.uid });
        if (typeof (person) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: person, location: 'validarJWT', resp });
        if (person === undefined) {
            if (decode.uid !== 'admin')
                return (0, errorController_1.rError)({ status: 400, msg: 'error persona no existe', location: 'validarJWT', param: decode.uid, resp });
        }
        next();
    }
    catch (error) {
        (0, errorController_1.rError)({ status: 400, msg: `${error}`, location: 'validarJWT', param: token, resp });
    }
});
exports.validarJWT = validarJWT;
//# sourceMappingURL=validar-jwt.js.map
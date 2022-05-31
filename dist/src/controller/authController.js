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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgetPassword = exports.ChangePassword = exports.tokenValido = exports.LogIn = void 0;
const interfaces_1 = require("../rules/interfaces");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const generar_jwt_1 = require("../helpers/generar-jwt");
const errorController_1 = require("./errorController");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const functions_1 = require("../functions/functions");
const apiMW_1 = __importDefault(require("../api/apiMW"));
const files_1 = require("../helpers/files");
const path_1 = __importDefault(require("path"));
const LogIn = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    let Service = undefined;
    let AccountMW = undefined;
    const { acceso, password } = req.body;
    try {
        const date = (0, functions_1.getDate)();
        const Person = (acceso.toLowerCase() === 'admin') ? interfaces_1.administrator : yield (0, querysTecnicos_1.GetPersonGeneral)((acceso.includes('@')) ? { email: acceso } : { user: acceso });
        if (typeof (Person) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Person, location: 'LogIn', resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 400, msg: `${(acceso.includes('@')) ? `correo` : `usuario`} ${acceso} no registrado`, location: 'LogIn', resp });
        if (Person.personName !== 'Administrator') {
            if (password !== Person.password)
                return (0, errorController_1.rError)({ status: 400, msg: `Contraseña incorrecta`, location: 'LogIn', resp });
        }
        else {
            if (password !== `pem${date.date.month}${date.date.day}${date.time.hour + 85}${date.weekday}`)
                return (0, errorController_1.rError)({ status: 400, msg: `Contraseña incorrecta`, location: 'LogIn', resp });
        }
        const { error, token } = yield (0, generar_jwt_1.generarJWT)(Person.id_person, Person.id_role);
        if (error)
            return (0, errorController_1.rError)({ status: 400, msg: `Error al generar el token`, location: 'LogIn', resp });
        if (Person.id_role === 1) {
            const resp = yield (0, querysTecnicos_1.GetTechnicalInService)(Person.id_person);
            if (typeof (resp) !== 'string') {
                Service = resp;
                if (Service) {
                    const response = yield (0, apiMW_1.default)(`informationAccount/${Service.accountMW}?moreInfo=true`, {}, 'GET');
                    const { status, data, errors } = response.data;
                    if (status === true) {
                        AccountMW = data === null || data === void 0 ? void 0 : data.account;
                    }
                }
            }
        }
        const isExistDirectory = yield (0, files_1.existDirectory)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person));
        const { password: p } = Person, rest = __rest(Person, ["password"]);
        return resp.status(200).json({
            status: true,
            data: { Person: rest, Service, AccountMW, token, directory: (isExistDirectory) ? yield (0, files_1.getFiles)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person)) : undefined }
        });
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `Error en el servidor Error: ${error}`, location: 'LogIn', resp });
    }
});
exports.LogIn = LogIn;
const tokenValido = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    let Service = undefined;
    let AccountMW = undefined;
    const token = req.header('x-token') || '';
    const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
    const decode = jsonwebtoken_1.default.verify(token, clave);
    const id_person = decode.uid;
    const Person = (id_person === 'admin') ? interfaces_1.administrator : yield (0, querysTecnicos_1.GetPersonGeneral)({ id: id_person });
    if (typeof (Person) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: Person, location: 'validarJWT', resp });
    if (Person === undefined)
        return (0, errorController_1.rError)({ status: 400, msg: 'error persona no existe', location: 'validarJWT', param: id_person, resp });
    if (Person.id_role === 1) {
        const resp = yield (0, querysTecnicos_1.GetTechnicalInService)(Person.id_person);
        if (typeof (resp) !== 'string') {
            Service = resp;
            if (Service) {
                const response = yield (0, apiMW_1.default)(`informationAccount/${Service.accountMW}?moreInfo=true`, {}, 'GET');
                const { status, data, errors } = response.data;
                if (status === true) {
                    AccountMW = data === null || data === void 0 ? void 0 : data.account;
                }
            }
        }
    }
    const { password: p } = Person, rest = __rest(Person, ["password"]);
    const isExistDirectory = yield (0, files_1.existDirectory)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person));
    return resp.status(200).json({
        status: true,
        data: { Person: rest, Service, AccountMW, token, directory: (isExistDirectory) ? yield (0, files_1.getFiles)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person)) : undefined }
    });
});
exports.tokenValido = tokenValido;
const ChangePassword = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const token = req.header('x-token') || '';
        const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
        const decode = jsonwebtoken_1.default.verify(token, clave);
        const id_person = decode.uid;
        if (id_person === 'admin')
            (0, errorController_1.rError)({ status: 400, msg: 'Administrador no puede cambiar la contraseña', resp });
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: id_person });
        if (typeof (Person) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: Person, location: 'ChangePassword', resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 400, msg: 'error persona no existe', location: 'ChangePassword', param: id_person, resp });
        const updated = yield (0, querysTecnicos_1.UpdatePerson)({ id_person: Person.id_person, prop: `password='${password}'` });
        if (typeof (updated) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: updated, location: 'ChangePassword', resp });
        return resp.status(200).json({
            status: true,
            data: { changed: true }
        });
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'ChangePassword', resp });
    }
});
exports.ChangePassword = ChangePassword;
const ForgetPassword = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { access, name, lastName, employeeNumber } = req.body;
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)((access.includes('@')) ? { email: access } : { user: access });
        if (typeof (Person) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Person, location: 'LogIn', resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 400, msg: `${(access.includes('@')) ? `correo` : `usuario`} ${access} no registrado`, location: 'LogIn', resp });
        if (Person.personName !== name || Person.lastname !== lastName || Person.employeeNumber !== employeeNumber)
            return (0, errorController_1.rError)({ status: 400, msg: 'Datos incorrectos', resp });
        const passwordWasReset = yield (0, querysTecnicos_1.UpdatePerson)({ id_person: Person.id_person, prop: `password = '${Person.employeeNumber}'` });
        if (typeof passwordWasReset === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: passwordWasReset, resp });
        return resp.status(200).json({
            status: true,
            data: { passwordWasReset }
        });
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, resp });
    }
});
exports.ForgetPassword = ForgetPassword;
//# sourceMappingURL=authController.js.map
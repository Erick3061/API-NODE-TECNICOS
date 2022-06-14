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
exports.verifyPassword = exports.verifyEventsService = exports.updateTask = exports.updateService = exports.modTechnicalToAService = exports.getVersionApp = exports.getTask = exports.getServices = exports.getServiceDetails = exports.getPersons = exports.getInServiceTechnicals = exports.getEvents = exports.getDisponibleTechnicals = exports.getActiveServices = exports.getAccountsMW = exports.addService = void 0;
const querysTecnicos_1 = require("../querys/querysTecnicos");
const functions_1 = require("../functions/functions");
const uuid_1 = require("uuid");
const errorController_1 = require("./errorController");
const connection_1 = require("../db/connection");
const mssql_1 = require("mssql");
const base_64_1 = __importDefault(require("base-64"));
const apiMW_1 = __importDefault(require("../api/apiMW"));
const generar_jwt_1 = require("../helpers/generar-jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../../app");
const filter = [
    { code: "ACZ", type: 1 },
    { code: "ASA", type: 1 },
    { code: "CPA", type: 1 },
    { code: "A", type: 1 },
    { code: "24H", type: 1 },
    { code: "FIRE", type: 1 },
    { code: "SMOKE", type: 1 },
    { code: "P", type: 1 },
    { code: "O", type: 1 },
    { code: "OS", type: 1 },
    { code: "C", type: 1 },
    { code: "CS", type: 1 }
];
/**
 * @name addService
 * @description -Agrega un servicio
 * @path {POST} /api/sys/addService
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {Object<{id:String, role:Number}>} grantedEntry -Datos del monitorista que esta creando el servicio, id:Identificador único, role:Rol que desempeña
 * @body {Number} id_type -Tipo de servicio
 * @body {String} CodigoCte -Número de cliente registrado en Monitoring Works
 * @body {Boolean} isKeyCode -True: Ver claves de usuario del panel, False: Ocultar claves de usuario del panel
 * @body {Boolean} isOpCi -True: Verifica aperturas o cierres, False: No verifica aperturas o cierres
 * @body {Array<string>} technicals -Identificadores únicos de los tecnicos que estan realizando el servicio. (Debe contener al menos un identificador)
 * @body {Object<{hours: Number, minutes: Number, seconds: Number}>} time -Tiempo límite para realizar el servicio
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const addService = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { CodigoCte, technicals, grantedEntry, id_type, isKeyCode, isOpCi, time } = req.body;
    try {
        if (time.hours < 2)
            return (0, errorController_1.rError)({ status: 401, msg: 'Minimo deben ser 2 hrs', location: 'addService', resp, });
        const id_service = (0, uuid_1.v4)();
        const response = yield (0, apiMW_1.default)(`single-account/${CodigoCte}`, {}, 'GET');
        const { status, data, errors } = response.data;
        if (status && data) {
            const { rowsAffected } = yield connection_1.pool1.request().query(`select accountMW from Service where accountMW='${CodigoCte}' and isActive = 'true'`);
            if (rowsAffected[0] !== 0) {
                return (0, errorController_1.rError)({ status: 400, msg: `La cuenta:${data.account.Nombre} con Abonado:${data.account.CodigoAbonado} no puede tener mas de un servicio activo a la vez`, location: 'addService', resp });
            }
            else {
                const idx = yield (0, querysTecnicos_1.GetIndexService)();
                if (typeof (idx) == 'string') {
                    throw new Error(`${idx}`);
                }
                else {
                    const Ffolio = base_64_1.default.encode(`${idx}`.padStart(6, 'F'));
                    const folio = `${Ffolio}_${base_64_1.default.encode(CodigoCte)}`;
                    const entryDate = (0, functions_1.getDate)();
                    const exitDate = (0, functions_1.modDate)({ hours: time.hours, minutes: time.minutes, seconds: time.seconds, dateI: entryDate.DATE });
                    const cron = `${exitDate.time.minute} ${exitDate.time.hour} ${exitDate.date.day} ${exitDate.date.month} ${exitDate.weekday}`;
                    const insert = { id_service, grantedEntry: grantedEntry.name, id_type, folio, accountMW: data.account.CodigoCte, isKeyCode, isOpCi, cron, entryDate: entryDate.DATE, exitDate: exitDate.DATE, digital: data.account.CodigoAbonado, nameAccount: data.account.Nombre };
                    const { isInserted, error } = yield (0, querysTecnicos_1.AddService)(insert);
                    if (isInserted) {
                        let asignados = [];
                        for (const id_technical of technicals) {
                            const { isInserted, error } = yield (0, querysTecnicos_1.AddTechnicalService)(id_service, id_technical);
                            if (isInserted) {
                                asignados = [...asignados, id_technical];
                            }
                        }
                        return resp.status(200).json({
                            status: true,
                            data: { isInserted, asignados }
                        });
                    }
                    else {
                        return (0, errorController_1.rError)({ status: 400, msg: `Error al insertar AddService ${error}`, location: 'addService', resp });
                    }
                }
            }
        }
        else {
            return (0, errorController_1.rError)({ status: 400, msg: errors[0].msg, location: 'addService', resp });
        }
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `Api: ${error}`, location: 'addService', resp });
    }
});
exports.addService = addService;
/**
 * @name getAccountsMW
 * @description Obtiene todas las cuentas de MW
 * @path {GET} /api/sys/getAccountsMW
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @query {String} [id_service] -Si solo se desea la cuenta asignada de Monitoring Works del servicio ingresado
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getAccountsMW = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; //una sola cuenta
    try {
        if (query.id_service) {
            // const service = await GetActiveService((typeof query.id_service === 'string') ? query.id_service : '');
            const service = yield (0, querysTecnicos_1.GetActiveServices)((typeof query.id_service === 'string') ? { service: { id_service: query.id_service } } : { service: { id_service: '' } });
            if (typeof service === 'string')
                throw new Error(service);
            // if (service === undefined) throw new Error(`Servicio no existe`);
            if (service.length === 0)
                throw new Error(`Servicio no existe`);
            const response = yield (0, apiMW_1.default)(`single-account/${service[0].accountMW}?more=true`, {}, 'GET');
            const { status, data, errors } = response.data;
            if (status && data) {
                return resp.status(200).json({
                    status: true,
                    data
                });
            }
            else {
                return (0, errorController_1.rError)({ status: 400, msg: errors[0].msg, location: 'getAccountsMW', resp });
            }
        }
        else {
            const response = yield (0, apiMW_1.default)('all-accounts', {}, 'GET');
            const { status, data, errors } = response.data;
            if (status && data) {
                return resp.status(200).json({
                    status: true,
                    data
                });
            }
            else {
                return (0, errorController_1.rError)({ status: 400, msg: errors[0].msg, location: 'getAccountsMW', resp });
            }
        }
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'getAccountsMW', resp });
    }
});
exports.getAccountsMW = getAccountsMW;
/**
 * @name getActiveServices
 * @description -Obtiene todos los servivios activos
 * @path {GET} /api/sys/getActiveServices
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @query {String} [id_service] -Si solo se requiere un servicio activo
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getActiveServices = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const services = yield (0, querysTecnicos_1.GetActiveServices)({});
    const token = req.header('x-token');
    const { id_service } = req.query;
    if (id_service) {
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service: (typeof id_service === 'string') ? id_service : '' } });
        if (typeof (service) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: service, location: 'GetActiveService', resp });
        // if (service === undefined)
        if (service.length === 0)
            return (0, errorController_1.rError)({ status: 400, msg: `Servicio no existe`, location: '', resp });
        const technicals = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)(service[0].id_service);
        if (typeof (technicals) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: technicals, location: 'GetTechnicalsInService', resp });
        return resp.json({
            status: true,
            data: {
                service: service[0],
                technicals: technicals.map(t => {
                    const { email, password, status, id_role } = t, rest = __rest(t, ["email", "password", "status", "id_role"]);
                    return Object.assign({}, rest);
                })
            }
        });
    }
    if (typeof (services) === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: services, location: 'GetActiveServices', resp });
    (_a = app_1.server.Task) === null || _a === void 0 ? void 0 : _a.deleteTaskifNotExist(services);
    services.map((s) => __awaiter(void 0, void 0, void 0, function* () { return (!s.isTimeExpired && (s.exitDate.getTime() - (0, functions_1.getDate)().DATE.getTime() < 0)) && (yield (0, querysTecnicos_1.UpdateService)({ id_service: s.id_service, prop: `isTimeExpired = 'true'`, interno: true })); }));
    const id_services = [...new Set(services.map(s => s.id_service))];
    const Enterprices = yield (0, functions_1.getEnterpriceOfTechnicals)(id_services);
    const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
    const decode = jsonwebtoken_1.default.verify(token, clave);
    if (typeof (decode) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: decode.uid });
        if (typeof person === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: person, resp });
        if (person.id_role === 3) {
            const prueba = Enterprices.filter(f => f.enterprice.find(e => e === person.id_enterprice)).map(m => m.id_service);
            const filtered = services.filter(f => prueba.find(fi => fi === f.id_service));
            return resp.json({
                status: true,
                data: {
                    services: filtered.map(s => {
                        const { firstVerification, grantedEntry, grantedExit, id_type, isActive, isKeyCode, isOpCi, secondVerification } = s, rest = __rest(s, ["firstVerification", "grantedEntry", "grantedExit", "id_type", "isActive", "isKeyCode", "isOpCi", "secondVerification"]);
                        return Object.assign({}, rest);
                    })
                }
            });
        }
    }
    return resp.json({
        status: true,
        data: {
            services: services.map(s => {
                const { firstVerification, grantedEntry, grantedExit, id_type, isActive, isKeyCode, isOpCi, secondVerification } = s, rest = __rest(s, ["firstVerification", "grantedEntry", "grantedExit", "id_type", "isActive", "isKeyCode", "isOpCi", "secondVerification"]);
                return Object.assign({}, rest);
            })
        }
    });
});
exports.getActiveServices = getActiveServices;
/**
 * @name getDisponibleTechnicals
 * @description -Obtiene todos los tecnicos activos
 * @path {GET} /api/sys/getDisponibleTechnicals
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @query {Object<{ id_enterprice: number, shortName: string, name: string }>} [enterprice] -Filtra los técnicos activos por empresa y envia solo los que coinciden a la empresa enviada
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getDisponibleTechnicals = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const technicals = yield (0, querysTecnicos_1.GetDisponibleTechnical)();
    const { enterprice } = req.query;
    let enterpriceSend;
    try {
        enterpriceSend = JSON.parse(`${enterprice}`);
    }
    catch (error) {
        enterpriceSend = undefined;
    }
    if (typeof (technicals) === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: technicals, location: 'GetDisponibleTechnical', resp });
    let tec = (enterpriceSend)
        ? technicals.filter(el => el.id_enterprice === (enterpriceSend === null || enterpriceSend === void 0 ? void 0 : enterpriceSend.id_enterprice)).map(el => { return { id_person: el.id_person, name: `${el.personName} ${el.lastname}`, id_enterprice: el.id_enterprice }; })
        : technicals.map(el => { return { id_person: el.id_person, name: `${el.personName} ${el.lastname}`, id_enterprice: el.id_enterprice }; });
    return resp.status(200).json({
        status: true,
        data: {
            technicals: tec
        }
    });
});
exports.getDisponibleTechnicals = getDisponibleTechnicals;
/**
 * @name getEvents
 * @description Obtiene los eventos que llegaron a Monitoring  Works de una cuenta asignada a un servicio activo.
 * @path {GET} /api/sys/getEvents/:id_service/:start/:end
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @param {String} :id_service -Identificador del servicio activo.
 * @param {String} :start -Fecha inicial de consulta
 * @param {String} :end -Fecha final de consulta
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getEvents = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_service, start, end } = req.params;
    try {
        // const service = await GetActiveService(id_service);
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
        if (typeof service === 'string')
            throw new Error(service);
        // if (service === undefined) throw new Error(`Servicio no existe`);
        if (service.length === 0)
            throw new Error(`Servicio no existe`);
        const send = {
            accounts: [service[0].accountMW],
            filter,
            exclude: false,
            orderBy: 'ASC',
            typeOrder: 'FechaHora',
            typeAccounts: 'A',
            ignoreGroups: false
        };
        const [startDate, startTime] = start.split('T');
        const [endDate, endTime] = end.split('T');
        const path = `events/${startDate}/${endDate}/1?startQuery=${startTime.substring(0, 5)}&endQuery=${endTime.substring(0, 5)}`;
        const response = yield (0, apiMW_1.default)(path, send, 'POST');
        const { status, data, errors } = response.data;
        if (status && data) {
            console.log(data);
            if (data[0].haveEvents) {
                return resp.status(200).json({
                    status: true,
                    data: {
                        events: data[0].eventos
                    }
                });
            }
            else {
                return resp.status(200).json({
                    status: true,
                    data: {
                        events: []
                    }
                });
            }
        }
        else {
            return (0, errorController_1.rError)({ status: 400, msg: errors[0].msg, location: 'apiMW->events', resp });
        }
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'getEvents', resp });
    }
});
exports.getEvents = getEvents;
/**
 * @name getInServiceTechnicals
 * @description Obtiene los técnicos que están en sitio o en algún servicio activo
 * @path {GET} /api/sys/getInServiceTechnicals
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getInServiceTechnicals = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const technicals = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)();
    if (typeof (technicals) === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: technicals, location: 'GetTechnicalsInService', resp });
    return resp.status(200).json({
        status: true,
        data: {
            technicals
        }
    });
});
exports.getInServiceTechnicals = getInServiceTechnicals;
/**
 * @name getPersons
 * @description Obtiene todas las personas registradas o por rol que pertenecen a la misma empresa que realizo el inicio se sesión
 * @path {GET} /api/sys/getPersons/:role
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión (Este filtra el personal que contenga el mismo id de empresa)
 * @param {String} :role -1: Técnicos, 2: Monitoristas u operadores, 3: Encargados de técnicos, 850827: Todo el personal
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getPersons = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    const id = parseInt(params.role);
    const token = req.header('x-token');
    const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
    const decode = jsonwebtoken_1.default.verify(token, clave);
    if (typeof (decode) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: decode.uid });
        if (typeof person === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: person, resp });
        if (person === undefined)
            return (0, errorController_1.rError)({ status: 400, msg: 'Persona no existe', resp });
        const Persons = yield (0, querysTecnicos_1.GetPersons)(id);
        if (typeof (Persons) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Persons, location: 'GetPersons', resp });
        return resp.json({
            status: true,
            data: { Persons: Persons.filter(f => f.id_enterprice === person.id_enterprice) }
        });
    }
    const Persons = yield (0, querysTecnicos_1.GetPersons)(id);
    if (typeof (Persons) === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: Persons, location: 'GetPersons', resp });
    return resp.json({
        status: true,
        data: { Persons }
    });
});
exports.getPersons = getPersons;
/**
 * @name getServiceDetails
 * @description Obtiene los detalles de un ervicio ya culminado
 * @path {GET} /api/sys/getServiceDetails/:id
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @param {String} :role -1: Técnicos, 2: Monitoristas u operadores, 3: Encargados de técnicos, 850827: Todo el personal
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getServiceDetails = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // const service = await GetActiveService(id, true);
    const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service: id, selected: true } });
    if (typeof service === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: service, resp, location: 'getService' });
    if (service.length === 0)
        throw new Error(`Servicio no existe`); //seagrego
    // const details = await GetService({ id_service: service.id_service });
    const details = yield (0, querysTecnicos_1.GetService)({ id_service: service[0].id_service });
    if (typeof details === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: details, resp, location: 'GetService->queryTech' });
    const { binnacle, comments } = details;
    return resp.json({
        status: true,
        data: { service: service[0], binnacle, comments }
    });
});
exports.getServiceDetails = getServiceDetails;
/**
 * @name getServices
 * @description Obtiene los servicios activos e inactivos por intervalo de fecha. (Solo se puede consultar un filtro a la vez)
 * @path {GET} /api/sys/getServices/:start/:end
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @param {String} :start -Fecha inicial de consulta
 * @param {String} :end -Fecha final de consulta
 * @query {String} [technical] -Filtra los servicios que le pertenecen a este técnico
 * @query {String} [account] -Filtra los servicios que le pertenecen a esta cuenta
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getServices = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, end } = req.params;
    const { technical, account } = req.query;
    const token = req.header('x-token');
    if (technical && account)
        return (0, errorController_1.rError)({ status: 400, msg: 'Formato invalido, solo se puede consultar un opcional a la vez', location: 'getServices', resp });
    if (technical) {
        const services = yield (0, querysTecnicos_1.GetServices)({ start, end, technical: `${technical}` });
        if (typeof (services) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: services, resp });
        return resp.json({
            status: true,
            data: {
                services
            }
        });
    }
    if (account) {
        const response = yield (0, apiMW_1.default)(`single-account/${account}`, {}, 'GET');
        const { status, data, errors } = response.data;
        if (errors)
            return (0, errorController_1.rError)({ status: 400, msg: `${errors[0].msg}`, resp });
        if (status && data) {
            const services = yield (0, querysTecnicos_1.GetServices)({ start, end, account: `${account}` });
            if (typeof (services) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: services, resp });
            return resp.json({
                status: true,
                data: {
                    services
                }
            });
        }
    }
    const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
    const decode = jsonwebtoken_1.default.verify(token, clave);
    if (typeof (decode) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: decode.uid });
        if (typeof person === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: person, resp });
        if (person.id_role === 3) {
            const services = yield (0, querysTecnicos_1.GetServices)({ start, end });
            if (typeof (services) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: services, resp });
            const Enterprices = services.map(s => {
                const id_service = s.id_service;
                const technicals = JSON.parse(`${s.technicals}`);
                let enterprices = [];
                let arr = [];
                if (technicals !== null) {
                    technicals.forEach(p => { enterprices = [...enterprices, { id_enterprice: p.id_enterprice, id_service }]; });
                    arr = [...new Set(enterprices.filter(f => f.id_service === id_service).map(m => m.id_enterprice))];
                }
                return { id_service, enterprice: arr };
            });
            const prueba = Enterprices.filter(f => f.enterprice.find(e => e === person.id_enterprice)).map(m => m.id_service);
            const filtered = services.filter(f => prueba.find(fi => fi === f.id_service));
            return resp.json({
                status: true,
                data: {
                    services: filtered,
                }
            });
        }
    }
    const services = yield (0, querysTecnicos_1.GetServices)({ start, end });
    if (typeof (services) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: services, resp });
    return resp.json({
        status: true,
        data: {
            services
        }
    });
});
exports.getServices = getServices;
/**
 * @name getTask
 * @description Obtiene las tareas programadas proximas a ejecutarse, al igual que el estado de los servicios activos
 * @path {GET} /api/sys/getTask
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getTask = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    return resp.json({
        status: true,
        data: { task: (_b = app_1.server.Task) === null || _b === void 0 ? void 0 : _b.getTask().map(t => { return { nameTask: t.nameTask, running: t.running, cron: t.cron }; }) }
    });
});
exports.getTask = getTask;
/**
 * @name getVersionApp
 * @description Obtiene la versión de la aplicacion movil.
 * @path {GET} /api/sys/getVersionApp
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getVersionApp = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .query(`select * from VersionApp`)
        .then(({ recordset }) => {
        return resp.status(200).json({
            status: true,
            data: Object.assign({}, recordset[0])
        });
    })
        .catch(err => (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp }));
});
exports.getVersionApp = getVersionApp;
/**
 * @name modTechnicalToAService
 * @description Elimina Técnico del servicio por error de asignación ó se le asigna o restringe el folio de ese servicio. (Funciona cuando hay mas de 2 técnicos asignados al servicio), Solo se puede hacer una opción a la vez o elimnar o (asignar o desasignar el folio del servicio) de un tecnico a la vez.
 * @path {POST} /api/sys/modTechnicalToAService
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {String} :id_service id del servicio, Este debe ser un servicio activo.
 * @body {Array<String>} :technicals Arreglo con los id de los tecnicos enviados o seleccionados aunque solo se tomará la primer posición (Se tomará en cuenta el tamaño total del arreglo en una actualizacón posterior)
 * @query {Boolean} [del] Para eliminar al técnico
 * @query {Boolean} [sf] Para dejar con o sin folio al técnico
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const modTechnicalToAService = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_service, technicals } = req.body;
        const { del, sf } = req.query;
        let errors = [];
        let asignados = [];
        // const service = await GetActiveService(id_service);
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
        if (typeof (service) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: `${service}`, location: 'GetActiveService', resp });
        // if (service === undefined) return rError({ status: 400, msg: `Servicio No existe`, location: 'addTechnicalToAService', resp });
        if (service.length === 0)
            return (0, errorController_1.rError)({ status: 400, msg: `Servicio No existe`, location: 'addTechnicalToAService', resp });
        if (del && sf)
            throw new Error("Solo debes mandar una opción");
        if (del) {
            const Delete = JSON.parse(`${del}`);
            if (Delete) {
                const technicalsInService = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)(service[0].id_service);
                if (typeof (technicalsInService) === 'string')
                    return (0, errorController_1.rError)({ status: 500, msg: technicalsInService, location: 'GetTechnicalsInService', resp });
                if (technicalsInService.length === 1)
                    return (0, errorController_1.rError)({ status: 401, msg: `El servicio no se puede quedar sin tecnicos asignados`, location: 'GetTechnicalsInService', resp });
                for (const id_technical of technicals) {
                    if (technicalsInService.find(f => f.id_person === id_technical) === undefined)
                        throw new Error(`Hay tecnicos que no corresponden a este servicio`);
                }
                const deleted = yield (0, querysTecnicos_1.DeleteTechnicaltoService)(id_service, technicals[0]);
                if (typeof deleted === 'string') {
                    errors = [...errors, deleted];
                }
                if (deleted) {
                    asignados = [...asignados, technicals[0]];
                }
                return resp.status(200).json({
                    status: true,
                    data: { id_service, eliminados: asignados, errors }
                });
            }
        }
        if (sf) {
            const SF = JSON.parse(`${sf}`);
            // const technicalsInService = await GetTechnicalsInServiceActive(service.id_service);
            const technicalsInService = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)(service[0].id_service);
            if (typeof (technicalsInService) === 'string')
                return (0, errorController_1.rError)({ status: 500, msg: technicalsInService, location: 'GetTechnicalsInService', resp });
            if (technicalsInService.length === 1)
                return (0, errorController_1.rError)({ status: 401, msg: `El servicio no se puede quedar sin tecnicos asignados`, location: 'GetTechnicalsInService', resp });
            for (const id_technical of technicals) {
                if (technicalsInService.find(f => f.id_person === id_technical) === undefined)
                    throw new Error(`Hay tecnicos que no corresponden a este servicio`);
            }
            const updated = yield (0, querysTecnicos_1.UpdateTechnical)({ id_service, id_person: technicals[0], prop: `withOutFolio='${SF ? 'true' : 'false'}'` });
            if (typeof updated === 'string') {
                errors = [...errors, updated];
            }
            if (updated) {
                asignados = [...asignados, technicals[0]];
            }
            return resp.status(200).json({
                status: true,
                data: { id_service, actualizados: asignados, errors }
            });
        }
        for (const id_technical of technicals) {
            const { isInserted, error } = yield (0, querysTecnicos_1.AddTechnicalService)(id_service, id_technical);
            if (error) {
                errors = [...errors, error];
            }
            if (isInserted) {
                asignados = [...asignados, id_technical];
            }
        }
        return resp.status(200).json({
            status: true,
            data: { id_service, asignados, errors }
        });
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'modTechnicalToAService', resp });
    }
});
exports.modTechnicalToAService = modTechnicalToAService;
/**
 * @name updateService
 * @description Realiza varias opciones del sericio activo (UNA A LA VEZ)
 * @path {POST} /api/sys/updateService
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {String} :id_service id del servicio activo.
 * @body {Object<{ id:String, role:Number, name:String }>} :person Datos del monitorista o encargado que realiza la acción
 * @body {'isKeyCode' | 'isDelivered' | 'accountMW' | 'firstVerification' | 'secondVerification' | 'moreTime' | 'SF' | 'EF' | 'TS'} :prop Opcion que realizará el proceso
 * @body {Object<{comment:String, moreTime:{hours:Number, minutes:Number, seconds:Number}}>} :value comment: Para agregar un comentario , moreTime:Para asignar mas tiempo limite al servico
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const updateService = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    /**Hay que regresar los datos a como estaban en el caso de error revisar mas tarde */
    const { person, id_service, prop, value } = req.body;
    try {
        // const service = await GetActiveService(id_service);
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
        if (typeof (service) === 'string')
            throw new Error(`${service}`);
        // if (service === undefined) throw new Error("Servicio no existente");
        if (service.length === 0)
            throw new Error("Servicio no existente");
        if (prop === 'isKeyCode' && typeof (value) === 'boolean') {
            const prop = `isKeyCode = '${(value) ? 'true' : 'false'}' `;
            const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop, interno: false });
            if (typeof (updated) === 'string')
                throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean')
                throw new Error("interno debe estar en false dentro de la api");
            return resp.json({ status: true, data: Object.assign({}, updated) });
        }
        if ((prop === 'SF' || prop === 'TS') && person.id && typeof (value) === 'object') {
            if (value.value === undefined)
                throw new Error(`Error de formato`);
            if (value.binnacle === undefined)
                throw new Error(`Error de formato`);
            if (value.value && value.comment !== '') {
                const comment = yield (0, querysTecnicos_1.AddComment)({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted)
                    throw new Error(`${comment.error}`);
            }
            const binnacle = yield (0, querysTecnicos_1.AddBinnacle)({ id_service, zones: value.binnacle.ze, missingZones: value.binnacle.zf, zonesUndefined: value.binnacle.zu, users: value.binnacle.ue, missingUsers: value.binnacle.uf, usersUndefined: value.binnacle.uu, link: value.binnacle.link, technicals: value.binnacle.technicals });
            if (!binnacle.isInserted)
                throw new Error(`${binnacle.error}`);
            const query = (prop === 'SF')
                ? `update Service set exitDate = @exitDate, grantedExit=@grantedExit, isActive='False', isTimeExpired='True' where id_service = @id_service`
                : `update Service set exitDate = @exitDate, grantedExit=@grantedExit, isActive='False', isTimeExpired='True', isDelivered='True' where id_service = @id_service`;
            const { rowsAffected } = yield connection_1.pool1.request()
                .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
                .input('grantedExit', mssql_1.TYPES.Text, person.name)
                .input('exitDate', mssql_1.TYPES.DateTime, (0, functions_1.getDate)().DATE)
                .query(query);
            if (rowsAffected[0] !== 0) {
                const prop = `cron = ''`;
                const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop, interno: false, selected: true });
                if (typeof (updated) === 'string')
                    throw new Error(`${updated}`);
                if (typeof (updated) === 'boolean')
                    throw new Error("interno debe estar en false dentro de la api");
                (_c = app_1.server.Task) === null || _c === void 0 ? void 0 : _c.delete(id_service);
                return resp.json({ status: true, data: Object.assign({}, updated) });
            }
            else {
                throw new Error(`Error al actualizar`);
            }
        }
        if (prop === 'EF' && person.id && typeof (value) === 'boolean') {
            const prop = `isDelivered = 'true'`;
            const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop, interno: false });
            if (typeof (updated) === 'string')
                throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean')
                throw new Error("interno debe estar en false dentro de la api");
            const comment = yield (0, querysTecnicos_1.AddComment)({ id_service, person: person.name, comment: `Entrego folio` });
            if (!comment.isInserted)
                throw new Error(`${comment.error}`);
            return resp.json({ status: true, data: Object.assign({}, updated) });
        }
        if (prop === 'moreTime' && typeof (value) === 'object') {
            if (value.moreTime === undefined)
                throw new Error(`Error de formato`);
            const exitDate = (0, functions_1.modDate)({ hours: value.moreTime.hours, minutes: value.moreTime.minutes, seconds: value.moreTime.seconds });
            const cron = `${exitDate.time.minute} ${exitDate.time.hour} ${exitDate.date.day} ${exitDate.date.month} ${exitDate.weekday}`;
            const { rowsAffected } = yield connection_1.pool1.request()
                .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
                .input('exitDate', mssql_1.TYPES.DateTime, exitDate.DATE)
                .query(`update Service set exitDate = @exitDate, isTimeExpired = 'false' where id_service = @id_service`);
            if (rowsAffected[0] !== 0) {
                const prop = `cron = '${cron}'`;
                const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop, interno: false });
                // const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `SYSTEM: Se agrego mas tiempo ${service.exitDate.toJSON()} - ${exitDate.DATE.toJSON()}` });
                const comment = yield (0, querysTecnicos_1.AddComment)({ id_service, person: person.name, comment: `SYSTEM: Se agrego mas tiempo ${service[0].exitDate.toJSON()} - ${exitDate.DATE.toJSON()}` });
                if (typeof (updated) === 'string')
                    throw new Error(`${updated}`);
                if (typeof (updated) === 'boolean')
                    throw new Error("interno debe estar en false dentro de la api");
                if (!comment.isInserted)
                    throw new Error(`${comment.error}`);
                (_d = app_1.server.Task) === null || _d === void 0 ? void 0 : _d.delete(id_service);
                // server.Task?.add(service.id_service, cron, false);
                (_e = app_1.server.Task) === null || _e === void 0 ? void 0 : _e.add(service[0].id_service, cron, false);
                return resp.json({
                    status: true,
                    data: Object.assign({}, updated)
                });
            }
            else {
                throw new Error(`Error al actualizar`);
            }
        }
        if (person.role === 2 && prop === 'secondVerification' && typeof (value) === 'object') {
            if (value.value)
                throw new Error(`Error de formato`);
            const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop: `secondVerification = '${person.name}'`, interno: false });
            if (value.comment !== '') {
                const comment = yield (0, querysTecnicos_1.AddComment)({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted)
                    throw new Error(`${comment.error}`);
            }
            if (typeof (updated) === 'string')
                throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean')
                throw new Error("interno debe estar en false dentro de la api");
            return resp.json({
                status: true,
                data: Object.assign({}, updated)
            });
        }
        else if (person.role === 3 && prop === 'firstVerification' && typeof (value) === 'object') {
            if (value.value)
                throw new Error(`Error de formato`);
            const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, prop: `firstVerification = '${person.name}'`, interno: false });
            if (value.comment !== '') {
                const comment = yield (0, querysTecnicos_1.AddComment)({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted)
                    throw new Error(`${comment.error}`);
            }
            if (typeof (updated) === 'string')
                throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean')
                throw new Error("interno debe estar en false dentro de la api");
            return resp.json({
                status: true,
                data: Object.assign({}, updated)
            });
        }
        else {
            return (0, errorController_1.rError)({ status: 500, msg: `Ningun caso contemplado`, location: 'updateService', resp });
        }
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'updateService', resp });
    }
});
exports.updateService = updateService;
/**
 * @name updateTask
 * @description Actualiza las tareas para que se mantengan actualizadas en los procesos de conexión y desconexión
 * @path {GET} /api/sys/updateTask
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const updateTask = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    yield ((_f = app_1.server.Task) === null || _f === void 0 ? void 0 : _f.update());
    return resp.json({
        status: true,
        data: { task: (_g = app_1.server.Task) === null || _g === void 0 ? void 0 : _g.getTask().map(t => { return { nameTask: t.nameTask, running: t.running, cron: t.cron }; }) }
    });
});
exports.updateTask = updateTask;
/**
 * @name verifyEventsService
 * @description Verifica las zonas, usuarios y particiones enviadas en el intervalo de consulta del servicio activo
 * @path {GET} /api/sys/verifyEventsService/:id_service
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @param {String} :id_service id del servicio activo
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const verifyEventsService = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    //Faltan las validaciones de la fecha
    const { id_service } = req.params;
    try {
        // const service = await GetActiveService(id_service);
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
        if (typeof service === 'string')
            throw new Error(service);
        // if (service === undefined) throw new Error(`Servicio no existe`);
        if (service.length === 0)
            throw new Error(`Servicio no existe`);
        const send = {
            // accounts: [service.accountMW],
            accounts: [service[0].accountMW],
            filter,
            exclude: false,
            orderBy: 'ASC',
            typeOrder: 'FechaHora',
            typeAccounts: 'A',
            ignoreGroups: false
        };
        // const start = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service.entryDate });
        // const end = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service.exitDate });
        const start = (0, functions_1.modDate)({ hours: 0, minutes: 0, seconds: 0, dateI: service[0].entryDate });
        const end = (0, functions_1.modDate)({ hours: 0, minutes: 0, seconds: 0, dateI: service[0].exitDate });
        const path = `events/${start.date.date}/${end.date.date}/1?startQuery=${start.time.time.substring(0, 5)}&endQuery=${end.time.time.substring(0, 5)}`;
        const response = yield (0, apiMW_1.default)(path, send, 'POST');
        const { status, data, errors } = response.data;
        if (status && data) {
            if (data[0].haveEvents) {
                const alarms = ['ACZ', 'ASA', 'CPA', 'A', '24H', 'FIRE', 'SMOKE', 'P'];
                const OpCi = ['O', 'OS', 'C', 'CS'];
                let zones = [];
                let users = [];
                data[0].eventos.forEach(ev => {
                    if (alarms.find(f => f === ev.CodigoAlarma)) {
                        if (zones.find(f => f === ev.CodigoZona) === undefined) {
                            zones = [...zones, ev.CodigoZona];
                        }
                    }
                    else if (OpCi.find(f => f === ev.CodigoAlarma)) {
                        if (users.find(f => f === ev.CodigoUsuario) === undefined) {
                            users = [...users, ev.CodigoUsuario];
                        }
                    }
                });
                return resp.json({
                    status: true,
                    data: {
                        zones,
                        users
                    }
                });
            }
            else {
                return resp.json({
                    status: true,
                    data: {
                        zones: [],
                        users: []
                    }
                });
            }
        }
        else {
            return (0, errorController_1.rError)({ status: 400, msg: errors[0].msg, location: 'verifyEventsService-> apiMW-> events', resp });
        }
    }
    catch (error) {
        return (0, errorController_1.rError)({ status: 500, msg: `${error}`, location: 'verifyEventsService', resp });
    }
});
exports.verifyEventsService = verifyEventsService;
/**
 * @name verifyPassword
 * @description Verifica que la contraseña enviada por un usuario que ha iniciado sesión corresponda a la registrada en la base de datos
 * @path {POST} /api/sys/validatePassword
 * @body {String} password Contraseña a verificar
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const verifyPassword = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const token = req.header('x-token');
    const clave = generar_jwt_1.SECRETORPPRIVATEKEY;
    const decode = jsonwebtoken_1.default.verify(token, clave);
    if (typeof (decode) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: decode, location: 'validarJWT', resp });
    const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: decode.uid });
    if (typeof person === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: person, resp });
    if (person === undefined)
        return (0, errorController_1.rError)({ status: 400, msg: 'Persona no existe', resp });
    if (password !== person.password)
        return (0, errorController_1.rError)({ status: 400, msg: 'Password invalida', resp });
    return resp.status(200).json({
        status: true,
        data: {
            isValid: true
        }
    });
});
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=sysController.js.map
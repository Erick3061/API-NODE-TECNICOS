import { Request, Response } from 'express';
import { GetIndexService, GetPersons, GetDisponibleTechnical, AddService, AddTechnicalService, GetTechnicalsInServiceActive, GetActiveServices, UpdateService, DeleteTechnicaltoService, AddComment, AddBinnacle, UpdateTechnical, GetServices, GetService, GetPersonGeneral } from '../querys/querysTecnicos';
import { account, PropAddService, ResponseApi, PropsAddService, RespInsert, PropsUpdateService, RespgetEvents, Enterprices, propsTechnicalBinnacle } from '../rules/interfaces';
import { getDate, getEnterpriceOfTechnicals, modDate } from '../functions/functions';
import { v4 as uuidv4 } from 'uuid';
import { rError } from './errorController';
import { pool1 } from '../db/connection';
import { TYPES } from "mssql";
import base64 from 'base-64';
import apiMW from "../api/apiMW";
import { SECRETORPPRIVATEKEY } from '../helpers/generar-jwt';
import jwt from 'jsonwebtoken';
import { server } from '../../app';

/** @module SYS_CONTROLLER */

interface sendData { 
    accounts: Array<string>, 
    filter: Array<{ code: string, type: number }>,
    exclude:boolean,
    orderBy:'ASC'|'DESC',
    typeOrder:'FechaHora',
    typeAccounts:'A'| 'I',
    ignoreGroups:boolean,
}

const filter:Array<{code:string, type:number}> =[
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
export const addService = async (req: Request, resp: Response) => {
    const { CodigoCte, technicals, grantedEntry, id_type, isKeyCode, isOpCi, time }: PropAddService = req.body;
    interface data { account: account }
    try {
        if (time.hours < 2) return rError({ status: 401, msg: 'Minimo deben ser 2 hrs', location: 'addService', resp, });
        const id_service = uuidv4();
        const response = await apiMW(`single-account/${CodigoCte}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<data> = response.data;
        if (status && data) {
            const { rowsAffected } = await pool1.request().query(`select accountMW from Service where accountMW='${CodigoCte}' and isActive = 'true'`);
            if (rowsAffected[0] !== 0) {
                return rError({ status: 400, msg: `La cuenta:${data.account.Nombre} con Abonado:${data.account.CodigoAbonado} no puede tener mas de un servicio activo a la vez`, location: 'addService', resp });
            } else {
                const idx = await GetIndexService();
                if (typeof (idx) == 'string') { throw new Error(`${idx}`); } else {
                    const Ffolio = base64.encode(`${idx}`.padStart(6, 'F'));
                    const folio = `${Ffolio}_${base64.encode(CodigoCte)}`;
                    const entryDate = getDate();
                    const exitDate = modDate({ hours: time.hours, minutes: time.minutes, seconds: time.seconds, dateI: entryDate.DATE });
                    const cron: string = `${exitDate.time.minute} ${exitDate.time.hour} ${exitDate.date.day} ${exitDate.date.month} ${exitDate.weekday}`;
                    const insert: PropsAddService = { id_service, grantedEntry: grantedEntry.name, id_type, folio, accountMW: data.account.CodigoCte, isKeyCode, isOpCi, cron, entryDate: entryDate.DATE, exitDate: exitDate.DATE, digital: data.account.CodigoAbonado, nameAccount: data.account.Nombre }
                    const { isInserted, error }: RespInsert = await AddService(insert);
                    if (isInserted) {
                        let asignados: Array<string> = [];
                        for (const id_technical of technicals) {
                            const { isInserted, error }: RespInsert = await AddTechnicalService(id_service, id_technical);
                            if (isInserted) { asignados = [...asignados, id_technical]; }
                        }
                        return resp.status(200).json({
                            status: true,
                            data: { isInserted, asignados }
                        });
                    } else { return rError({ status: 400, msg: `Error al insertar AddService ${error}`, location: 'addService', resp }); }
                }
            }
        } else { return rError({ status: 400, msg: errors![0].msg, location: 'addService', resp }); }
    } catch (error) {
        return rError({ status: 500, msg: `Api: ${error}`, location: 'addService', resp });
    }
}

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
export const getAccountsMW = async (req: Request, resp: Response) => {
    const query = req.query;//una sola cuenta
    interface data { accounts: Array<account> }
    try {
        if (query.id_service) {
            // const service = await GetActiveService((typeof query.id_service === 'string') ? query.id_service : '');
            const service = await GetActiveServices((typeof query.id_service === 'string') ? { service: { id_service: query.id_service } } : { service: { id_service: '' } });
            if (typeof service === 'string') throw new Error(service);
            // if (service === undefined) throw new Error(`Servicio no existe`);
            if (service.length === 0) throw new Error(`Servicio no existe`);
            const response = await apiMW(`single-account/${service[0].accountMW}?more=true`, {}, 'GET');
            const { status, data, errors }: ResponseApi<{ account: account }> = response.data;
            if (status && data) {
                return resp.status(200).json({
                    status: true,
                    data
                });
            } else {
                return rError({ status: 400, msg: errors![0].msg, location: 'getAccountsMW', resp });
            }
        } else {
            const response = await apiMW('all-accounts', {}, 'GET');
            const { status, data, errors }: ResponseApi<data> = response.data;
            if (status && data) {
                return resp.status(200).json({
                    status: true,
                    data
                });
            } else {
                return rError({ status: 400, msg: errors![0].msg, location: 'getAccountsMW', resp });
            }
        }
    } catch (error) {
        return rError({ status: 500, msg: `${error}`, location: 'getAccountsMW', resp });
    }
}

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
export const getActiveServices = async (req: Request, resp: Response) => {
    const services = await GetActiveServices({});
    const token = req.header('x-token');
    const { id_service } = req.query;

    if (id_service) {
        const service = await GetActiveServices({ service: { id_service: (typeof id_service === 'string') ? id_service : '' } });
        if (typeof (service) === 'string')
            return rError({ status: 500, msg: service, location: 'GetActiveService', resp });
        // if (service === undefined)
        if (service.length === 0)
            return rError({ status: 400, msg: `Servicio no existe`, location: '', resp });
        const technicals = await GetTechnicalsInServiceActive(service[0].id_service);
        if (typeof (technicals) === 'string')
            return rError({ status: 500, msg: technicals, location: 'GetTechnicalsInService', resp });
        return resp.json({
            status: true,
            data: {
                service: service[0],
                technicals: technicals.map(t => {
                    const { email, password, status, id_role, ...rest } = t;
                    return { ...rest }
                })
            }
        });
    }

    if (typeof (services) === 'string') return rError({ status: 500, msg: services, location: 'GetActiveServices', resp });
    server.Task?.deleteTaskifNotExist(services);
    services.map(async s => (!s.isTimeExpired && (s.exitDate.getTime() - getDate().DATE.getTime() < 0)) && await UpdateService({ id_service: s.id_service, prop: `isTimeExpired = 'true'`, interno: true }));
    const id_services: Array<string> = [...new Set(services.map(s => s.id_service))];
    const Enterprices = await getEnterpriceOfTechnicals(id_services);
    const clave = SECRETORPPRIVATEKEY;
    const decode = jwt.verify(token!, clave);
    if (typeof (decode) === 'string') return rError({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = await GetPersonGeneral({ id: decode.uid });
        if (typeof person === 'string') return rError({ status: 500, msg: person, resp });
        if (person.id_role === 3) {
            const prueba = Enterprices.filter(f => f.enterprice.find(e => e === person.id_enterprice)).map(m => m.id_service);
            const filtered = services.filter(f => prueba.find(fi => fi === f.id_service));
            return resp.json({
                status: true,
                data: {
                    services: filtered.map(s => {
                        const { firstVerification, grantedEntry, grantedExit, id_type, isActive, isKeyCode, isOpCi, secondVerification, ...rest } = s;
                        return { ...rest }
                    })
                }
            });
        }
    }
    return resp.json({
        status: true,
        data: {
            services: services.map(s => {
                const { firstVerification, grantedEntry, grantedExit, id_type, isActive, isKeyCode, isOpCi, secondVerification, ...rest } = s;
                return { ...rest }
            })
        }
    })
}

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
export const getDisponibleTechnicals = async (req: Request, resp: Response) => {
    const technicals = await GetDisponibleTechnical();
    const { enterprice } = req.query;
    let enterpriceSend: Enterprices | undefined;
    try {
        enterpriceSend = JSON.parse(`${enterprice}`);
    } catch (error) {
        enterpriceSend = undefined;
    }

    if (typeof (technicals) === 'string')
        return rError({ status: 500, msg: technicals, location: 'GetDisponibleTechnical', resp });

    let tec =
        (enterpriceSend)
            ? technicals.filter(el => el.id_enterprice === enterpriceSend?.id_enterprice).map(el => { return { id_person: el.id_person, name: `${el.personName} ${el.lastname}`, id_enterprice: el.id_enterprice } })
            : technicals.map(el => { return { id_person: el.id_person, name: `${el.personName} ${el.lastname}`, id_enterprice: el.id_enterprice } });
    return resp.status(200).json({
        status: true,
        data: {
            technicals: tec
        }
    });
}

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
export const getEvents = async (req: Request, resp: Response) => {
    const { id_service, start, end } = req.params;
    try {
        // const service = await GetActiveService(id_service);
        const service = await GetActiveServices({ service: { id_service } });
        if (typeof service === 'string') throw new Error(service);
        // if (service === undefined) throw new Error(`Servicio no existe`);
        if (service.length === 0) throw new Error(`Servicio no existe`);

        const send: sendData = {
            accounts: [service[0].accountMW],
            filter,
            exclude:false,
            orderBy:'ASC',
            typeOrder:'FechaHora',
            typeAccounts:'A',
            ignoreGroups:false
        }
        const [startDate, startTime] = start.split('T');
        const [endDate, endTime] = end.split('T');
        const path: string = `events/${startDate}/${endDate}/1?startQuery=${startTime.substring(0, 5)}&endQuery=${endTime.substring(0, 5)}`;
        const response = await apiMW(path, send, 'POST');
        const { status, data, errors }: ResponseApi<Array<RespgetEvents>> = response.data;
        if (status && data) {
            console.log(data);
            
            if (data[0].haveEvents) {
                return resp.status(200).json({
                    status: true,
                    data: {
                        events: data[0].eventos
                    }
                });
            } else {
                return resp.status(200).json({
                    status: true,
                    data: {
                        events: []
                    }
                });
            }
        } else {
            return rError({ status: 400, msg: errors![0].msg, location: 'apiMW->events', resp });
        }
    } catch (error) {
        return rError({ status: 500, msg: `${error}`, location: 'getEvents', resp });
    }
}

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
export const getInServiceTechnicals = async (req: Request, resp: Response) => {
    const technicals = await GetTechnicalsInServiceActive();
    if (typeof (technicals) === 'string')
        return rError({ status: 500, msg: technicals, location: 'GetTechnicalsInService', resp });
    return resp.status(200).json({
        status: true,
        data: {
            technicals
        }
    });

}

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
export const getPersons = async (req: Request, resp: Response) => {
    const params = req.params;
    const id = parseInt(params.role);
    const token = req.header('x-token');

    const clave = SECRETORPPRIVATEKEY;
    const decode = jwt.verify(token!, clave);
    if (typeof (decode) === 'string')
        return rError({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = await GetPersonGeneral({ id: decode.uid });
        if (typeof person === 'string') return rError({ status: 500, msg: person, resp });
        if (person === undefined) return rError({ status: 400, msg: 'Persona no existe', resp });
        const Persons = await GetPersons(id);
        if (typeof (Persons) === 'string') return rError({ status: 500, msg: Persons, location: 'GetPersons', resp });
        return resp.json({
            status: true,
            data: { Persons: Persons.filter(f => f.id_enterprice === person.id_enterprice) }
        });
    }
    const Persons = await GetPersons(id);
    if (typeof (Persons) === 'string') return rError({ status: 500, msg: Persons, location: 'GetPersons', resp });
    return resp.json({
        status: true,
        data: { Persons }
    });
}

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
export const getServiceDetails = async (req: Request, resp: Response) => {
    const { id } = req.params;
    // const service = await GetActiveService(id, true);
    const service = await GetActiveServices({ service: { id_service: id, selected: true } });
    if (typeof service === 'string') return rError({ status: 400, msg: service, resp, location: 'getService' });
    if (service.length === 0) throw new Error(`Servicio no existe`);//seagrego
    // const details = await GetService({ id_service: service.id_service });
    const details = await GetService({ id_service: service[0].id_service });
    if (typeof details === 'string') return rError({ status: 400, msg: details, resp, location: 'GetService->queryTech' });
    const { binnacle, comments } = details;
    return resp.json({
        status: true,
        data: { service: service[0], binnacle, comments }
    });
}

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
export const getServices = async (req: Request, resp: Response) => {
    const { start, end } = req.params;
    const { technical, account } = req.query;
    const token = req.header('x-token');

    if (technical && account) return rError({ status: 400, msg: 'Formato invalido, solo se puede consultar un opcional a la vez', location: 'getServices', resp });
    if (technical) {
        const services = await GetServices({ start, end, technical: `${technical}` });
        if (typeof (services) === 'string') return rError({ status: 400, msg: services, resp });
        return resp.json({
            status: true,
            data: {
                services
            }
        })
    }

    if (account) {
        const response = await apiMW(`single-account/${account}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ account: account }> = response.data;
        if (errors) return rError({ status: 400, msg: `${errors[0].msg}`, resp });
        if (status && data) {
            const services = await GetServices({ start, end, account: `${account}` });
            if (typeof (services) === 'string') return rError({ status: 400, msg: services, resp });
            return resp.json({
                status: true,
                data: {
                    services
                }
            })
        }
    }

    const clave = SECRETORPPRIVATEKEY;
    const decode = jwt.verify(token!, clave);
    if (typeof (decode) === 'string') return rError({ status: 400, msg: decode, location: 'validarJWT', resp });
    if (decode.uid !== 'admin') {
        const person = await GetPersonGeneral({ id: decode.uid });
        if (typeof person === 'string') return rError({ status: 500, msg: person, resp });
        if (person.id_role === 3) {
            const services = await GetServices({ start, end });
            if (typeof (services) === 'string') return rError({ status: 400, msg: services, resp });
            const Enterprices = services.map(s => {
                const id_service: string = s.id_service;
                const technicals: Array<propsTechnicalBinnacle> | null = JSON.parse(`${s.technicals}`);
                let enterprices: Array<{ id_enterprice: number, id_service: string | undefined }> = [];
                let arr: Array<number> = [];
                if (technicals !== null) {
                    technicals.forEach(p => { enterprices = [...enterprices, { id_enterprice: p.id_enterprice, id_service }] });
                    arr = [...new Set(enterprices.filter(f => f.id_service === id_service).map(m => m.id_enterprice))];
                }
                return { id_service, enterprice: arr }
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

    const services = await GetServices({ start, end });
    if (typeof (services) === 'string') return rError({ status: 400, msg: services, resp });
    return resp.json({
        status: true,
        data: {
            services
        }
    })
}

/**
 * @name getTask
 * @description Obtiene las tareas programadas proximas a ejecutarse, al igual que el estado de los servicios activos
 * @path {GET} /api/sys/getTask
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const getTask = async (req: Request, resp: Response) => {
    return resp.json({
        status: true,
        data: { task: server.Task?.getTask().map(t => { return { nameTask: t.nameTask, running: t.running, cron: t.cron } }) }
    });
}

/**
 * @name getVersionApp
 * @description Obtiene la versión de la aplicacion movil.
 * @path {GET} /api/sys/getVersionApp
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const getVersionApp = async (req: Request, resp: Response) => {
    return await pool1.request()
        .query(`select * from VersionApp`)
        .then(({ recordset }) => {
            return resp.status(200).json({
                status: true,
                data: { ...recordset[0] }
            });
        })
        .catch(err => rError({ status: 500, msg: `${err}`, resp }))
}

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
export const modTechnicalToAService = async (req: Request, resp: Response) => {
    try {
        const { id_service, technicals }: { id_service: string, technicals: Array<string> } = req.body;
        const { del, sf } = req.query;
        let errors: Array<string> = [];
        let asignados: Array<string> = [];
        // const service = await GetActiveService(id_service);
        const service = await GetActiveServices({ service: { id_service } });
        if (typeof (service) === 'string') return rError({ status: 500, msg: `${service}`, location: 'GetActiveService', resp });
        // if (service === undefined) return rError({ status: 400, msg: `Servicio No existe`, location: 'addTechnicalToAService', resp });
        if (service.length === 0) return rError({ status: 400, msg: `Servicio No existe`, location: 'addTechnicalToAService', resp });
        if (del && sf) throw new Error("Solo debes mandar una opción");

        if (del) {
            const Delete: boolean = JSON.parse(`${del}`);
            if (Delete) {
                const technicalsInService = await GetTechnicalsInServiceActive(service[0].id_service);
                if (typeof (technicalsInService) === 'string')
                    return rError({ status: 500, msg: technicalsInService, location: 'GetTechnicalsInService', resp });
                if (technicalsInService.length === 1)
                    return rError({ status: 401, msg: `El servicio no se puede quedar sin tecnicos asignados`, location: 'GetTechnicalsInService', resp });
                for (const id_technical of technicals) {
                    if (technicalsInService.find(f => f.id_person === id_technical) === undefined)
                        throw new Error(`Hay tecnicos que no corresponden a este servicio`);
                }
                const deleted = await DeleteTechnicaltoService(id_service, technicals[0]);
                if (typeof deleted === 'string') { errors = [...errors, deleted] }
                if (deleted) { asignados = [...asignados, technicals[0]]; }

                return resp.status(200).json({
                    status: true,
                    data: { id_service, eliminados: asignados, errors }
                });
            }
        }
        if (sf) {

            const SF: boolean = JSON.parse(`${sf}`);
            // const technicalsInService = await GetTechnicalsInServiceActive(service.id_service);
            const technicalsInService = await GetTechnicalsInServiceActive(service[0].id_service);
            if (typeof (technicalsInService) === 'string')
                return rError({ status: 500, msg: technicalsInService, location: 'GetTechnicalsInService', resp });
            if (technicalsInService.length === 1)
                return rError({ status: 401, msg: `El servicio no se puede quedar sin tecnicos asignados`, location: 'GetTechnicalsInService', resp });
            for (const id_technical of technicals) {
                if (technicalsInService.find(f => f.id_person === id_technical) === undefined)
                    throw new Error(`Hay tecnicos que no corresponden a este servicio`);
            }
            const updated = await UpdateTechnical({ id_service, id_person: technicals[0], prop: `withOutFolio='${SF ? 'true' : 'false'}'` });
            if (typeof updated === 'string') { errors = [...errors, updated] }
            if (updated) { asignados = [...asignados, technicals[0]]; }

            return resp.status(200).json({
                status: true,
                data: { id_service, actualizados: asignados, errors }
            });
        }

        for (const id_technical of technicals) {
            const { isInserted, error }: RespInsert = await AddTechnicalService(id_service, id_technical);
            if (error) { errors = [...errors, error] }
            if (isInserted) { asignados = [...asignados, id_technical]; }
        }
        return resp.status(200).json({
            status: true,
            data: { id_service, asignados, errors }
        });


    } catch (error) {
        return rError({ status: 500, msg: `${error}`, location: 'modTechnicalToAService', resp });
    }
}

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
export const updateService = async (req: Request, resp: Response) => {
    /**Hay que regresar los datos a como estaban en el caso de error revisar mas tarde */
    const { person, id_service, prop, value }: PropsUpdateService = req.body;
    try {
        // const service = await GetActiveService(id_service);
        const service = await GetActiveServices({ service: { id_service } });
        if (typeof (service) === 'string') throw new Error(`${service}`);
        // if (service === undefined) throw new Error("Servicio no existente");
        if (service.length === 0) throw new Error("Servicio no existente");

        if (prop === 'isKeyCode' && typeof (value) === 'boolean') {
            const prop: string = `isKeyCode = '${(value) ? 'true' : 'false'}' `;
            const updated = await UpdateService({ id_service, prop, interno: false });
            if (typeof (updated) === 'string') throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
            return resp.json({ status: true, data: { ...updated } });
        }

        if ((prop === 'SF' || prop === 'TS') && person.id && typeof (value) === 'object') {
            if (value.value === undefined) throw new Error(`Error de formato`);
            if (value.binnacle === undefined) throw new Error(`Error de formato`);

            if (value.value && value.comment !== '') {
                const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted) throw new Error(`${comment.error}`);
            }
            const binnacle: { isInserted: boolean, error?: string } = await AddBinnacle({ id_service, zones: value.binnacle.ze, missingZones: value.binnacle.zf, zonesUndefined: value.binnacle.zu, users: value.binnacle.ue, missingUsers: value.binnacle.uf, usersUndefined: value.binnacle.uu, link: value.binnacle.link, technicals: value.binnacle.technicals });
            if (!binnacle.isInserted) throw new Error(`${binnacle.error}`);

            const query: string =
                (prop === 'SF')
                    ? `update Service set exitDate = @exitDate, grantedExit=@grantedExit, isActive='False', isTimeExpired='True' where id_service = @id_service`
                    : `update Service set exitDate = @exitDate, grantedExit=@grantedExit, isActive='False', isTimeExpired='True', isDelivered='True' where id_service = @id_service`

            const { rowsAffected } = await pool1.request()
                .input('id_service', TYPES.VarChar(40), id_service)
                .input('grantedExit', TYPES.Text, person.name)
                .input('exitDate', TYPES.DateTime, getDate().DATE)
                .query(query);
            if (rowsAffected[0] !== 0) {
                const prop: string = `cron = ''`;
                const updated = await UpdateService({ id_service, prop, interno: false, selected: true });
                if (typeof (updated) === 'string') throw new Error(`${updated}`);
                if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
                server.Task?.delete(id_service);
                return resp.json({ status: true, data: { ...updated } });
            } else { throw new Error(`Error al actualizar`); }
        }

        if (prop === 'EF' && person.id && typeof (value) === 'boolean') {
            const prop: string = `isDelivered = 'true'`;
            const updated = await UpdateService({ id_service, prop, interno: false });
            if (typeof (updated) === 'string') throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
            const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `Entrego folio` });
            if (!comment.isInserted) throw new Error(`${comment.error}`);
            return resp.json({ status: true, data: { ...updated } });
        }

        if (prop === 'moreTime' && typeof (value) === 'object') {
            if (value.moreTime === undefined) throw new Error(`Error de formato`);
            const exitDate = modDate({ hours: value.moreTime.hours, minutes: value.moreTime.minutes, seconds: value.moreTime.seconds });
            const cron: string = `${exitDate.time.minute} ${exitDate.time.hour} ${exitDate.date.day} ${exitDate.date.month} ${exitDate.weekday}`;

            const { rowsAffected } = await pool1.request()
                .input('id_service', TYPES.VarChar(40), id_service)
                .input('exitDate', TYPES.DateTime, exitDate.DATE)
                .query(`update Service set exitDate = @exitDate, isTimeExpired = 'false' where id_service = @id_service`);
            if (rowsAffected[0] !== 0) {
                const prop: string = `cron = '${cron}'`;
                const updated = await UpdateService({ id_service, prop, interno: false });
                // const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `SYSTEM: Se agrego mas tiempo ${service.exitDate.toJSON()} - ${exitDate.DATE.toJSON()}` });
                const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `SYSTEM: Se agrego mas tiempo ${service[0].exitDate.toJSON()} - ${exitDate.DATE.toJSON()}` });
                if (typeof (updated) === 'string') throw new Error(`${updated}`);
                if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
                if (!comment.isInserted) throw new Error(`${comment.error}`);
                server.Task?.delete(id_service);
                // server.Task?.add(service.id_service, cron, false);
                server.Task?.add(service[0].id_service, cron, false);

                return resp.json({
                    status: true,
                    data: { ...updated }
                });
            } else { throw new Error(`Error al actualizar`); }
        }

        if (person.role === 2 && prop === 'secondVerification' && typeof (value) === 'object') {
            if (value.value) throw new Error(`Error de formato`);
            const updated = await UpdateService({ id_service, prop: `secondVerification = '${person.name}'`, interno: false });
            if (value.comment !== '') {
                const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted) throw new Error(`${comment.error}`);
            }
            if (typeof (updated) === 'string') throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
            return resp.json({
                status: true,
                data: { ...updated }
            });

        } else if (person.role === 3 && prop === 'firstVerification' && typeof (value) === 'object') {
            if (value.value) throw new Error(`Error de formato`);

            const updated = await UpdateService({ id_service, prop: `firstVerification = '${person.name}'`, interno: false });
            if (value.comment !== '') {
                const comment: { isInserted: boolean, error?: string } = await AddComment({ id_service, person: person.name, comment: `${prop} ${value.comment}` });
                if (!comment.isInserted) throw new Error(`${comment.error}`);
            }
            if (typeof (updated) === 'string') throw new Error(`${updated}`);
            if (typeof (updated) === 'boolean') throw new Error("interno debe estar en false dentro de la api");
            return resp.json({
                status: true,
                data: { ...updated }
            });

        } else { return rError({ status: 500, msg: `Ningun caso contemplado`, location: 'updateService', resp }); }

    } catch (error) { return rError({ status: 500, msg: `${error}`, location: 'updateService', resp }); }
}

/**
 * @name updateTask
 * @description Actualiza las tareas para que se mantengan actualizadas en los procesos de conexión y desconexión
 * @path {GET} /api/sys/updateTask
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const updateTask = async (req: Request, resp: Response) => {
    await server.Task?.update();
    return resp.json({
        status: true,
        data: { task: server.Task?.getTask().map(t => { return { nameTask: t.nameTask, running: t.running, cron: t.cron } }) }
    });
}

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
export const verifyEventsService = async (req: Request, resp: Response) => {
    //Faltan las validaciones de la fecha
    const { id_service } = req.params;
    try {
        // const service = await GetActiveService(id_service);
        const service = await GetActiveServices({ service: { id_service } });
        if (typeof service === 'string') throw new Error(service);
        // if (service === undefined) throw new Error(`Servicio no existe`);
        if (service.length === 0) throw new Error(`Servicio no existe`);
        const send: sendData = {
            // accounts: [service.accountMW],
            accounts: [service[0].accountMW],
            filter,
            exclude:false,
            orderBy:'ASC',
            typeOrder:'FechaHora',
            typeAccounts:'A',
            ignoreGroups:false
        }        
        // const start = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service.entryDate });
        // const end = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service.exitDate });
        const start = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service[0].entryDate });
        const end = modDate({ hours: 0, minutes: 0, seconds: 0, dateI: service[0].exitDate });
        const path: string = `events/${start.date.date}/${end.date.date}/1?startQuery=${start.time.time.substring(0, 5)}&endQuery=${end.time.time.substring(0, 5)}`;
        const response = await apiMW(path, send, 'POST');        
        const { status, data, errors }: ResponseApi<Array<RespgetEvents>> = response.data;
        if (status && data) {
            if (data[0].haveEvents) {
                const alarms = ['ACZ', 'ASA', 'CPA', 'A', '24H', 'FIRE', 'SMOKE', 'P'];
                const OpCi = ['O', 'OS', 'C', 'CS'];
                let zones: Array<string> = [];
                let users: Array<string> = [];
                data[0].eventos.forEach(ev => {
                    if (alarms.find(f => f === ev.CodigoAlarma)) {
                        if (zones.find(f => f === ev.CodigoZona) === undefined) {
                            zones = [...zones, ev.CodigoZona];
                        }
                    } else if (OpCi.find(f => f === ev.CodigoAlarma)) {
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
            } else {
                return resp.json({
                    status: true,
                    data: {
                        zones: [],
                        users: []
                    }
                });
            }
        } else {
            return rError({ status: 400, msg: errors![0].msg, location: 'verifyEventsService-> apiMW-> events', resp });
        }
    } catch (error) {
        return rError({ status: 500, msg: `${error}`, location: 'verifyEventsService', resp });
    }
}

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
export const verifyPassword = async (req: Request, resp: Response) => {
    const { password } = req.body;
    const token = req.header('x-token');
    const clave = SECRETORPPRIVATEKEY;
    const decode = jwt.verify(token!, clave);
    if (typeof (decode) === 'string') return rError({ status: 400, msg: decode, location: 'validarJWT', resp });
    const person = await GetPersonGeneral({ id: decode.uid });
    if (typeof person === 'string') return rError({ status: 500, msg: person, resp });
    if (person === undefined) return rError({ status: 400, msg: 'Persona no existe', resp });
    if (password !== person.password) return rError({ status: 400, msg: 'Password invalida', resp });
    return resp.status(200).json({
        status: true,
        data: {
            isValid: true
        }
    })
}
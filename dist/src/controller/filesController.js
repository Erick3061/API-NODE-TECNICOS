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
exports.loadFile = exports.deleteFileToService = exports.getImgs = exports.sendFile = void 0;
const errorController_1 = require("./errorController");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const files_1 = require("../helpers/files");
const path_1 = __importDefault(require("path"));
/** @module FILES_CONTROLLER */
/**
 * @name sendFile
 * @description retorna el recurso consultado
 * @path {GET} /api/files/getImg
 * @response {Object} response
 * @response {File} files.ext Retorna un recurso como archivo
 * @response {Array} [response.errors] Errores en la petición
 */
const sendFile = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, img, type } = req.query;
    if (id === undefined || img === undefined || type === undefined)
        return (0, errorController_1.rError)({ status: 404, msg: 'Error faltan parametros', resp });
    if (type !== 'Service' && type !== 'Person' && type !== 'Enterprice')
        return (0, errorController_1.rError)({ status: 400, msg: 'No existe drectorio', resp });
    const directory = path_1.default.join(__dirname, '../../uploads', type, `${id}`, `${img}`);
    const isExist = yield (0, files_1.existDirectory)(directory);
    return (isExist) ? resp.sendFile(directory) : (0, errorController_1.rError)({ status: 404, msg: 'Directorio inexistente', resp });
});
exports.sendFile = sendFile;
/**
 * @name getImgs
 * @description Retorna un Arreglo de los nombres de los archivos de un directorio ya sea un Servicio, Persona, Empresa
 * @path {GET} /api/files/getImgs/:id/:type
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {String} id id de la persona, servicio, empresa(en proxima actualización)
 * @body {String} type Tipo de carpeta {'Service' | 'Person' | 'Enterprice'}
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getImgs = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, type } = req.params;
    const directory = path_1.default.join(__dirname, `../../uploads/${type}`, id);
    if (!(yield (0, files_1.existDirectory)(directory)))
        return (0, errorController_1.rError)({ status: 401, msg: 'Directorio no existe', resp });
    if (type === 'Service') {
        const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service: id, selected: true } });
        if (typeof (service) === 'string')
            return (0, errorController_1.rError)({ status: 404, msg: service, resp });
        if (service.length === 0)
            return (0, errorController_1.rError)({ status: 404, msg: `Servicio no existe`, resp });
        if (service[0].filesCron === 'deleted')
            return resp.status(200).json({ status: true, data: { files: [] } });
    }
    if (type === 'Person') {
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id });
        if (typeof (Person) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: Person, resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 500, msg: 'Pesona no existe', resp });
    }
    if (type === 'Enterprice') {
    }
    const files = yield (0, files_1.getFiles)(directory);
    return (Array.isArray(files)) ? resp.status(200).json({ status: true, data: { files } }) : (0, errorController_1.rError)({ status: 500, msg: 'Error en el servidor de archivos...', resp });
});
exports.getImgs = getImgs;
/**
 * @name deleteFileToService
 * @description elimina archivos de un servicio en especifico, si la carpeta se queda sin ningun archivo, la carpeta será elimnada
 * @path {POST} /api/files/deleteFileToService
 * @body {String} id_service id del servicio activo
 * @body {String} file Nombre del archivo con su extensión
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const deleteFileToService = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_service, file } = req.body;
    const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
    if (typeof (service) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: service, resp });
    if (service.length === 0)
        return (0, errorController_1.rError)({ status: 500, msg: 'Servicio no existe', resp });
    const directory = path_1.default.join(__dirname, '../../uploads/Service', service[0].id_service);
    const isExist = yield (0, files_1.existDirectory)(directory);
    if (isExist) {
        const files = yield (0, files_1.getFiles)(directory);
        if (files.length === 0) {
            const isDeleted = yield (0, files_1.deleteDirectory)(directory);
            if (typeof (isDeleted) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
            return resp.status(200).json({
                status: true,
                data: { isDeleted: true }
            });
        }
        if (files.includes(file)) {
            const isDeleted = yield (0, files_1.deleteFile)(path_1.default.join(directory, file));
            if (typeof (isDeleted) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
            const files = yield (0, files_1.getFiles)(directory);
            if (files.length === 0) {
                const isDeleted = yield (0, files_1.deleteDirectory)(directory);
                if (typeof (isDeleted) === 'string')
                    return (0, errorController_1.rError)({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
                const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, interno: true, prop: `filesCron = 'standby'` });
                if (typeof (updated) === 'string')
                    return (0, errorController_1.rError)({ status: 400, msg: 'Error al cambiar el estado de los archivos del servicio a standby', resp });
                if (typeof (updated) === 'object')
                    return (0, errorController_1.rError)({ status: 500, msg: 'respuesta invalida loadFile debe ser un proceso interno', resp });
                return resp.status(200).json({
                    status: true,
                    data: {
                        isDeleted: true,
                    }
                });
            }
            return resp.status(200).json({
                status: true,
                data: {
                    isDeleted: true,
                }
            });
        }
        else {
            return (0, errorController_1.rError)({ status: 500, msg: 'No existe el archivo', resp });
        }
    }
    else {
        return (0, errorController_1.rError)({ status: 500, msg: 'Directorio inexistente', resp });
    }
});
exports.deleteFileToService = deleteFileToService;
/**
 * @name loadFile
 * @description Carga un archivo en un directorio dentro del servidor
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @path {PUT} /api/files/loadFile/:id/:type
 * @body {String} id id del servicio, persona o empresa
 * @body {String} type Tipo de carpeta a guardar 'Service', 'Person', 'Enterprice'
 * @body {FILE} file Archivo seleccionado con extensión: 'png', 'jpg', 'jpeg'
 */
const loadFile = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, type } = req.params;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file)
        return (0, errorController_1.rError)({ status: 400, msg: 'No hay archivos que subir', resp });
    let response;
    switch (type) {
        case 'Service':
            const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service: id } });
            if (typeof (service) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: service, resp });
            if (service.length === 0)
                return (0, errorController_1.rError)({ status: 500, msg: 'Servicio no existe', resp });
            response = yield (0, files_1.upLoadFile)({ files: req.files, type, carpeta: service[0].id_service });
            if (typeof response === 'string') {
                return (0, errorController_1.rError)({ status: 400, msg: response, resp });
            }
            if (service[0].filesCron === 'standby') {
                const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service: id, interno: true, prop: `filesCron = 'going up'` });
                if (typeof (updated) === 'string') {
                    const deleted = yield (0, files_1.deleteFile)(response.fullDirectory);
                    if (typeof (deleted) === 'string')
                        return (0, errorController_1.rError)({ status: 500, msg: `Error: ${deleted}`, resp });
                    return (0, errorController_1.rError)({ status: 400, msg: `Error al actualizar fileCron del servicio ${service[0].id_service} ${updated}`, resp });
                }
                ;
                if (typeof (updated) === 'object')
                    return (0, errorController_1.rError)({ status: 500, msg: 'respuesta invalida loadFile debe ser un proceso interno', resp });
            }
            return resp.status(200).json({
                status: true,
                data: Object.assign({ isInserted: true }, response)
            });
        case 'Person':
            const id_person = id;
            const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: id_person });
            if (typeof (Person) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: Person, resp });
            if (Person === undefined)
                return (0, errorController_1.rError)({ status: 500, msg: 'Pesona no existe', resp });
            response = yield (0, files_1.upLoadFile)({ files: req.files, type, carpeta: id_person });
            if (typeof response === 'string')
                return (0, errorController_1.rError)({ status: 500, msg: response, resp });
            return resp.status(200).json({
                status: true,
                data: Object.assign({ isInserted: true }, response)
            });
        case 'Enterprice':
            break;
        default: return (0, errorController_1.rError)({ status: 400, msg: 'parametro invalido', resp });
    }
});
exports.loadFile = loadFile;
//# sourceMappingURL=filesController.js.map
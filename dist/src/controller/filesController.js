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
const sendFile = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, img, type } = req.query;
    if (id === undefined || img === undefined || type === undefined)
        return (0, errorController_1.rError)({ status: 404, msg: 'Error faltan parametros', resp });
    if (type !== 'Service' && type !== 'Person' && type !== 'Enterprice')
        return (0, errorController_1.rError)({ status: 400, msg: 'No existe drectorio', resp });
    const directory = path_1.default.join(__dirname, '../../uploads', type, `${id}`, `${img}`);
    const isExist = yield (0, files_1.existDirectory)(directory);
    if (isExist) {
        console.log(directory);
        const files = yield (0, files_1.getFiles)(directory);
        if (files.includes(`${img}`)) {
            console.log(files);
            resp.sendFile(directory);
        }
        else {
            return (0, errorController_1.rError)({ status: 404, msg: 'Error', resp });
        }
    }
    else {
        return (0, errorController_1.rError)({ status: 404, msg: 'Error', resp });
    }
});
exports.sendFile = sendFile;
const getImgs = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, type } = req.params;
    const completePath = `../../uploads/${type}`;
    const directory = path_1.default.join(__dirname, completePath, id);
    let service = undefined;
    let Person;
    if (type === 'Service') {
        service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service: id, selected: true } });
        if (typeof (service) === 'string')
            return (0, errorController_1.rError)({ status: 404, msg: service, resp });
        if (service.length === 0)
            return (0, errorController_1.rError)({ status: 404, msg: `Servicio no existe`, resp });
        if (service[0].filesCron === 'deleted')
            return (0, errorController_1.rError)({ status: 400, msg: 'No existen Fotos ya han sido eliminadas de manera automatica', resp });
    }
    if (type === 'Person') {
        Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id });
        if (typeof (Person) === 'string')
            return (0, errorController_1.rError)({ status: 400, msg: Person, resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 500, msg: 'Pesona no existe', resp });
    }
    if (type === 'Enterprice') {
    }
    const files = yield (0, files_1.getFiles)(directory);
    if (typeof (files) === 'string')
        return (0, errorController_1.rError)({ status: 400, msg: (service && service[0].filesCron === 'standby') ? 'No se han subido fotos' : files, resp });
    return resp.status(200).json({
        status: true,
        data: { files }
    });
});
exports.getImgs = getImgs;
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
const loadFile = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, type } = req.params;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file)
        return (0, errorController_1.rError)({ status: 400, msg: 'No hay archivos que subir', resp });
    switch (type) {
        case 'Service':
            const id_service = id;
            const service = yield (0, querysTecnicos_1.GetActiveServices)({ service: { id_service } });
            if (typeof (service) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: service, resp });
            if (service.length === 0)
                return (0, errorController_1.rError)({ status: 500, msg: 'Servicio no existe', resp });
            return yield (0, files_1.upLoadFile)({ files: req.files, type, carpeta: service[0].id_service }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const data = JSON.parse(`${response}`);
                if (service[0].filesCron === 'standby') {
                    const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service, interno: true, prop: `filesCron = 'going up'` });
                    if (typeof (updated) === 'string') {
                        const deleted = yield (0, files_1.deleteFile)(data.fullDirectory);
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
                    data: Object.assign({ isInserted: true }, data)
                });
            })).catch(err => {
                (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp });
            });
        case 'Person':
            const id_person = id;
            const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: id_person });
            if (typeof (Person) === 'string')
                return (0, errorController_1.rError)({ status: 400, msg: Person, resp });
            if (Person === undefined)
                return (0, errorController_1.rError)({ status: 500, msg: 'Pesona no existe', resp });
            return yield (0, files_1.upLoadFile)({ files: req.files, type, id: id_person }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const data = JSON.parse(`${response}`);
                return resp.status(200).json({
                    status: true,
                    data: Object.assign({ isInserted: true }, data)
                });
            })).catch(err => {
                (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp });
            });
        case 'Enterprice':
            break;
        default: return (0, errorController_1.rError)({ status: 400, msg: 'parametro invalido', resp });
    }
});
exports.loadFile = loadFile;
//# sourceMappingURL=filesController.js.map
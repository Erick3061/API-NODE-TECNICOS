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
exports.isDate = exports.existRoleinDB = exports.existTechnicals = exports.ExistPersonInDB = exports.existTypeService = exports.existEmail = exports.existRole = exports.validateOptionUpdatePerson = exports.validateOptionUpdateEnterprice = exports.validEnterprice = exports.existEnterprice = void 0;
const connection_1 = require("../db/connection");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const moment_1 = __importDefault(require("moment"));
;
/**@module HELPERS */
/**
 * @description Verifica si no existe la empresa
 * @param {Object<{ id: Number, shortName: String}>}
 */
const existEnterprice = ({ id, shortName }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        throw new Error("El campo id del objeto enterprice es obligatorio");
    if (!shortName)
        throw new Error("El campo shortName del objeto enterprice es obligatorio");
    try {
        const { rowsAffected } = yield connection_1.pool1.request().query(`select * from Enterprice where shortName = '${shortName}' and id_enterprice=${id}`);
        if (rowsAffected[0] === 0)
            throw new Error(`La empresa: ${shortName} con id: ${id} no existe`);
    }
    catch (error) {
        throw new Error(`${error}`);
    }
});
exports.existEnterprice = existEnterprice;
/**
 * Verifica si existe la empresa
 * @param {Object<{ shorName:String, name:String }>}
 */
const validEnterprice = ({ shortName, name }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!name)
        throw new Error("El campo id del objeto enterprice es obligatorio");
    if (!shortName)
        throw new Error("El campo shortName del objeto enterprice es obligatorio");
    try {
        const { rowsAffected } = yield connection_1.pool1.request().query(`select * from Enterprice where shortName = '${shortName}' or name = '${name}'`);
        if (rowsAffected[0] !== 0)
            throw new Error(`La empresa ya existe`);
    }
    catch (error) {
        throw new Error(`${error}`);
    }
});
exports.validEnterprice = validEnterprice;
/**
 * Valida las opciones para poder eliminar o actualizar los datos de una empresa
 * @param {Object<{deleteEnterprice: Boolean | Undefined, updateData:Object<{shortName:String , name:String}>}>} option
 * @returns True:Todos los valores excelentes, False: Valores inválidos
 */
const validateOptionUpdateEnterprice = (option) => {
    const entries = Object.entries(option);
    if (entries.length > 1)
        throw new Error("Solo se debe mandar una opción");
    const actionValues = ['deleteEnterprice', 'updateData'];
    const [action, obj] = entries[0];
    const value = actionValues.find(a => a === action);
    if (value) {
        switch (value) {
            case 'deleteEnterprice':
                if (typeof obj === 'boolean')
                    return true;
                throw new Error("Valores del objeto invalidos");
            case 'updateData':
                if (typeof obj === 'object') {
                    const params = ['name'];
                    const keys = Object.keys(obj);
                    const props = params.filter(m => keys.find(f => f === m) === undefined);
                    if (props.length > 0)
                        throw new Error("Faltan propiedades");
                    return true;
                }
                throw new Error("Valores del objeto invalidos");
            default: throw new Error("Nimgún caso contemplado");
        }
    }
    else
        throw new Error("Nimgún caso contemplado");
};
exports.validateOptionUpdateEnterprice = validateOptionUpdateEnterprice;
/**
 * Valida si las opciones para editar o actualizar una persona son validas
 * @param {Object} option
 * @returns True:Todo correcto
 */
const validateOptionUpdatePerson = (option) => {
    const entries = Object.entries(option);
    if (entries.length > 1)
        throw new Error("Solo se debe mandar una opción");
    const actionValues = ['resetPassword', 'deletePerson', 'updateStatus', 'updateData'];
    const [action, obj] = entries[0];
    const value = actionValues.find(a => a === action);
    if (value) {
        switch (value) {
            case 'resetPassword':
                if (typeof obj === 'boolean')
                    return true;
                throw new Error("Valores del objeto invalidos");
            case 'deletePerson':
                if (typeof obj === 'boolean')
                    return true;
                throw new Error("Valores del objeto invalidos");
            case 'updateStatus':
                if (typeof obj === 'string') {
                    if (obj === 'ACTIVO' || obj === 'INACTIVO')
                        return true;
                }
                throw new Error("Valores del objeto invalidos");
            case 'updateData':
                if (typeof obj === 'object') {
                    const params = ['name', 'lastname', 'email', 'password', 'phoneNumber', 'employeeNumber', 'enterprice', 'role'];
                    const keys = Object.keys(obj);
                    const props = params.filter(m => keys.find(f => f === m) === undefined);
                    if (props.length > 0) {
                        if (props.length === 1 && props[0] === 'password')
                            return true;
                        throw new Error("Faltan propiedades");
                    }
                    return true;
                }
                throw new Error("Valores del objeto invalidos");
            default: throw new Error("Nimgún caso contemplado");
        }
    }
    else
        throw new Error("Nimgún caso contemplado");
};
exports.validateOptionUpdatePerson = validateOptionUpdatePerson;
/**
 * Valida si existe el rol de usuario
 * @param {Object<{id:Number, name:String, user:String , Undefined}>} props
 * @param {Request} req
 */
const existRole = ({ id, name, user }, req) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!id)
        throw new Error("El campo id del objeto Role es obligatorio");
    if (!name)
        throw new Error("El campo id del objeto Role es obligatorio");
    if (user === '') {
        if (id === 2)
            throw new Error("Debe asignar un usuario si se trata de un monitorista");
        else if (body.email === '')
            throw new Error("Debe de asignar un nombre de usuario si la persona no cuenta con correo de la empresa");
    }
    else {
        const exist = yield (0, querysTecnicos_1.UserAccess)({ id_user: null, exist: { nameUser: user, id_role: id } });
        if (exist === null || exist === void 0 ? void 0 : exist.error)
            throw new Error(`${exist.error.msg}`);
    }
    try {
        const { rowsAffected } = yield connection_1.pool1.request().query(`select * from Role where id_role=${id} and name='${name}'`);
        if (rowsAffected[0] === 0)
            throw new Error(`El rol: ${name} con id: ${id} no existe`);
    }
    catch (error) {
        throw new Error(`${error}`);
    }
});
exports.existRole = existRole;
/**
 * Valida si existe el correo enviado
 * @param {String} email correo enviado
 */
const existEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowsAffected } = yield connection_1.pool1.request().query(`select * from Person where email='${email}'`);
        if (rowsAffected[0] !== 0)
            throw new Error(`El correo: ${email} ya existe`);
    }
    catch (error) {
        throw new Error(`${error}`);
    }
});
exports.existEmail = existEmail;
/**
 * Verifica si existe el tipo de servicio
 * @param {Number} id_type id del tipo
 * @returns Boolean
 */
const existTypeService = (id_type) => __awaiter(void 0, void 0, void 0, function* () {
    const type = yield (0, querysTecnicos_1.GetTypes)({ id_type });
    if (typeof (type) === 'string')
        throw new Error(`${type}`);
    if (type.length === 0)
        throw new Error(`id: ${id_type} No existe`);
    return true;
});
exports.existTypeService = existTypeService;
/**
 * Verifica si existe la persona en la base de datos
 * @param {Object<{id:String, role:Number}>} param
 * @returns Boolean
 */
const ExistPersonInDB = ({ id, role }) => __awaiter(void 0, void 0, void 0, function* () {
    const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id, role });
    if (typeof (person) === 'string')
        throw new Error(`${person}`);
    if (person === undefined) {
        const person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id, role, inactive: 'INACTIVO' });
        if (typeof (person) === 'string')
            throw new Error(`${person}`);
        if (person === undefined)
            throw new Error(`id: ${id} No existe`);
    }
    return true;
});
exports.ExistPersonInDB = ExistPersonInDB;
/**
 * Verifica si existe el técnico
 * @param {Array<string>} technicals
 * @param { Array<string,any >} query
 * @returns Boolean
 */
const existTechnicals = (technicals, query) => __awaiter(void 0, void 0, void 0, function* () {
    if (technicals.length === 0)
        throw new Error(`Debes asignar al menos un tecnico a este servicio`);
    if (query.del !== undefined || query.sf !== undefined) {
        return true;
    }
    else {
        for (const iterator of technicals) {
            const exist = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: iterator, role: 1 });
            if (typeof (exist) === 'string')
                throw new Error(`${exist}`);
            if (exist === undefined)
                throw new Error(`Tecnico con id: ${iterator} no existe`);
            const inService = yield (0, querysTecnicos_1.ExistTechnicalInService)(exist.id_person);
            if (typeof (inService) === 'string')
                throw new Error(`${inService}`);
            if (inService !== undefined)
                throw new Error(`Tecnico: ${inService.personName} ${inService.lastname} esta asignado a otro servicio activo`);
        }
        return true;
    }
});
exports.existTechnicals = existTechnicals;
/**
 * Verifica si existe el identificador de rol de una persona
 * @param {string} id_role Rol de persona
 * @returns Boolean
 */
const existRoleinDB = (id_role) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(id_role);
    if (id === 850827)
        return true;
    const exist = yield (0, querysTecnicos_1.GetRoles)({ id_role: id });
    if (typeof (exist) === 'string')
        throw new Error(`${exist}`);
    if (exist.length === 0)
        throw new Error(`El rol: ${id_role} No existe`);
    return true;
});
exports.existRoleinDB = existRoleinDB;
/**
 * Verifica si es una fecha valida
 * @param {string} date Fecha
 * @returns Boolean
 */
const isDate = (date) => {
    if ((0, moment_1.default)(date, "YYYY-MM-DD", true).isValid())
        return true;
    else
        throw new Error("Formato de fecha invalido");
};
exports.isDate = isDate;
//# sourceMappingURL=db-validators.js.map
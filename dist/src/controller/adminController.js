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
exports.getGeneral = exports.Enterprice = exports.addPerson = exports.addEnterprice = exports.actionsPerson = exports.actionsEnterprice = void 0;
const connection_1 = require("../db/connection");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const errorController_1 = require("./errorController");
const mssql_1 = require("mssql");
const files_1 = require("../helpers/files");
const path_1 = __importDefault(require("path"));
const actionsEnterprice = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { enterprice, option } = req.body;
    if (option.deleteEnterprice) {
    }
    if (option.updateData) {
        const { rowsAffected: isExist } = yield connection_1.pool1.request()
            .input('id_enterprice', mssql_1.TYPES.Numeric, enterprice.id)
            .input('shortName', mssql_1.TYPES.VarChar(50), option.updateData.shortName)
            .input('name', mssql_1.TYPES.VarChar(150), option.updateData.name)
            .query(`Select * from enterprice where shortName = @shortName and name = @name and id_enterprice != @id_enterprice`);
        if (isExist[0] !== 0)
            return (0, errorController_1.rError)({ status: 400, msg: `Los datos de la emmpresa ya existem`, resp });
        return yield connection_1.pool1.request()
            .input('id_enterprice', mssql_1.TYPES.Numeric, enterprice.id)
            .input('shortName', mssql_1.TYPES.VarChar(50), option.updateData.shortName)
            .input('name', mssql_1.TYPES.VarChar(150), option.updateData.name)
            .query(`Update Enterprice set shortName = @shortName, name = @name where id_enterprice = @id_enterprice`)
            .then(() => resp.status(200).json({
            status: true,
            data: {
                isUpdated: true
            }
        }))
            .catch(err => (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp }));
    }
    const Enterprice = yield (0, querysTecnicos_1.GetEnterprices)({ enterprice: { id_enterprice: enterprice.id, shortName: enterprice.shortName } });
    if (typeof Enterprice === 'string')
        return (0, errorController_1.rError)({ status: 500, msg: Enterprice, resp });
    return resp.status(200).json({
        status: true,
        data: {
            enterprice: Enterprice[0]
        }
    });
});
exports.actionsEnterprice = actionsEnterprice;
const actionsPerson = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { person, option } = req.body;
    if (option.resetPassword) {
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: person.id });
        if (typeof Person === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Person, resp });
        if (Person === undefined)
            return (0, errorController_1.rError)({ status: 400, msg: `Persona inactiva, Activela para restaurar su contraseña`, resp });
        const passwordWasReset = yield (0, querysTecnicos_1.UpdatePerson)({ id_person: Person.id_person, prop: `password = '${Person.employeeNumber}'` });
        if (typeof passwordWasReset === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: passwordWasReset, resp });
        return resp.status(200).json({
            status: true,
            data: { passwordWasReset, Person }
        });
    }
    if (option.deletePerson) {
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: person.id, inactive: 'INACTIVO' });
        if (typeof (Person) === 'object') {
            if (Person.id_role === 1) {
                const Technicals = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)();
                if (typeof (Technicals) === 'string')
                    return (0, errorController_1.rError)({ status: 500, msg: Technicals, resp, location: 'GetTechnicalsInServiceActive' });
                if (Technicals.find(f => f.id_person === Person.id_person))
                    return (0, errorController_1.rError)({ status: 400, msg: `Técnico: ${Person.personName} ${Person.lastname} esta en servicio`, resp, location: 'deletePerson' });
            }
            return yield connection_1.pool1.request().query(`delete Person where id_person = '${Person.id_person}'`).then(() => __awaiter(void 0, void 0, void 0, function* () {
                const isExistDirectory = yield (0, files_1.existDirectory)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person));
                if (isExistDirectory) {
                    const isDeleted = yield (0, files_1.deleteDirectory)(path_1.default.join(__dirname, '../../uploads/Person', Person.id_person));
                    console.log(isDeleted);
                }
                return resp.status(200).json({ status: true, data: { isDeleted: true } });
            })).catch(err => (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp, location: 'deletePerson' }));
        }
        else {
            return (0, errorController_1.rError)({ status: 400, msg: `Primero debe Desactivar la persona seleccionada`, resp, location: 'deletePerson' });
        }
    }
    if (option.updateStatus) {
        if (person.role === 1 && option.updateStatus === 'INACTIVO') {
            const Technicals = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)();
            if (typeof (Technicals) === 'string')
                return (0, errorController_1.rError)({ status: 500, msg: Technicals, resp, location: 'GetTechnicalsInServiceActive' });
            if (Technicals.find(f => f.id_person === person.id))
                return (0, errorController_1.rError)({ status: 400, msg: `No se puede desactivar un técnico esta en servicio`, resp, location: 'updateStatusPerson' });
        }
        const isUpdated = yield (0, querysTecnicos_1.UpdatePerson)({ id_person: person.id, prop: `status = '${option.updateStatus}'` });
        return (typeof isUpdated === 'string')
            ? (0, errorController_1.rError)({ status: 500, msg: `${isUpdated}`, resp, location: 'updateStatusPerson' })
            : resp.status(200).json({ status: true, data: { isUpdated } });
    }
    if (option.updateData) {
        let data = option.updateData;
        const Person = yield (0, querysTecnicos_1.GetPersonGeneral)({ id: person.id });
        if (typeof (Person) === 'string')
            throw (Person);
        if (Person === undefined)
            throw ("No existe la persona");
        const { role, enterprice, email, employeeNumber, lastname, name, password, phoneNumber } = option.updateData;
        const Enterprices = yield (0, querysTecnicos_1.GetEnterprices)({ shortName: enterprice.shortName });
        if (typeof Enterprices === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Enterprices, resp });
        if (Enterprices.length === 0)
            return (0, errorController_1.rError)({ status: 400, msg: 'No esiste la empresa', resp });
        const Roles = yield (0, querysTecnicos_1.GetRoles)({ role: { id_role: role.id, name: role.name } });
        if (typeof Roles === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: Roles, resp });
        if (Roles.length === 0)
            return (0, errorController_1.rError)({ status: 400, msg: 'No existe el Rol', resp });
        if (employeeNumber === '')
            return (0, errorController_1.rError)({ status: 400, msg: `La persona no se puede quedar sin numero de empleado`, resp });
        if (email !== '') {
            const { recordset: existEmail } = yield connection_1.pool1.request()
                .input('id_person', mssql_1.TYPES.VarChar(40), person.id)
                .input('email', mssql_1.TYPES.VarChar, email)
                .query(`select email from Person where email = @email and id_person != @id_person`);
            if (existEmail.length > 0)
                return (0, errorController_1.rError)({ status: 400, msg: `El correo ${email} ya existe`, resp });
        }
        if (Person.employeeNumber !== employeeNumber) {
            const isExistEmployeNumber = yield (0, querysTecnicos_1.ExistEployeeNumber)({ employeeNumber: employeeNumber, id_enterprice: enterprice.id, personExclude: person.id });
            if (typeof (isExistEmployeNumber) === 'string')
                return (0, errorController_1.rError)({ status: 500, msg: isExistEmployeNumber, resp });
            if (isExistEmployeNumber)
                return (0, errorController_1.rError)({ status: 400, msg: `Número de empleado ya esta asignado a otra persona`, resp });
            data = (Person.id_role !== 2) ? Object.assign(Object.assign({}, data), { password: data.employeeNumber }) : data;
        }
        if (Person.nameUser !== role.user && data.role.id !== 2) {
            try {
                //verificar si la persona tiene un usuario registrado...
                const isPersonHaveUser = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, personHaveUser: { nameUser: role.user } });
                if (isPersonHaveUser && !isPersonHaveUser.isPersonHaveUser) { //No tiene usuario enUsers
                    if (role.user !== '') { //insertar
                        const existWithoutThisPerson = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, existWithoutThisPerson: { nameUser: role.user } });
                        if (existWithoutThisPerson === null || existWithoutThisPerson === void 0 ? void 0 : existWithoutThisPerson.error)
                            return (0, errorController_1.rError)({ status: existWithoutThisPerson.error.status, msg: existWithoutThisPerson.error.msg, resp });
                        const isInserted = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, insert: { nameUser: role.user } });
                        if (isInserted === null || isInserted === void 0 ? void 0 : isInserted.error)
                            return (0, errorController_1.rError)({ status: isInserted.error.status, msg: isInserted.error.msg, resp });
                    }
                }
                else { //Tiene usuario en users
                    if (role.user === '') { //delete
                        const isDeleted = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, deleteUser: true });
                        if (typeof (isDeleted) === 'string')
                            return (0, errorController_1.rError)({ status: 500, msg: isDeleted, resp });
                    }
                    else { //update
                        const existWithoutThisPerson = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, existWithoutThisPerson: { nameUser: role.user } });
                        if (existWithoutThisPerson === null || existWithoutThisPerson === void 0 ? void 0 : existWithoutThisPerson.error)
                            return (0, errorController_1.rError)({ status: existWithoutThisPerson.error.status, msg: existWithoutThisPerson.error.msg, resp });
                        const isUpdated = yield (0, querysTecnicos_1.UserAccess)({ id_user: person.id, update: { nameUser: role.user } });
                        if (isUpdated === null || isUpdated === void 0 ? void 0 : isUpdated.error)
                            return (0, errorController_1.rError)({ status: isUpdated.error.status, msg: isUpdated.error.msg, resp });
                    }
                }
            }
            catch (error) {
                return (0, errorController_1.rError)({ status: 500, msg: `${error}`, resp });
            }
        }
        const updated = yield (0, querysTecnicos_1.UpdatePerson)({ id_person: person.id, data: { email, employeeNumber, lastname, password: password === undefined ? Person.password : password, personName: name, phoneNumber } });
        if (typeof (updated) === 'string')
            return (0, errorController_1.rError)({ status: 500, msg: updated, resp });
        return resp.status(200).json({
            status: true,
            data: {
                isUpdated: true
            }
        });
    }
});
exports.actionsPerson = actionsPerson;
const addEnterprice = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { enterprice } = req.body;
    return yield connection_1.pool1.request()
        .input('shortName', mssql_1.TYPES.VarChar(50), enterprice.shortName)
        .input('name', mssql_1.TYPES.VarChar(150), enterprice.name)
        .query(`Insert into Enterprice( shortName, name ) values ( @shortName, @name )`)
        .then(() => {
        return resp.json({
            status: true,
            data: {
                isInserted: true
            }
        });
    })
        .catch(err => (0, errorController_1.rError)({ status: 500, msg: `${err}`, resp }));
});
exports.addEnterprice = addEnterprice;
const addPerson = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    let body = req.body;
    const { error, isInserted } = yield (0, querysTecnicos_1.addPersonBD)(body);
    return (isInserted)
        ? resp.status(isInserted.status).json({ status: true, data: { isInserted: true } })
        : (error) ? (0, errorController_1.rError)({ status: error.status, msg: error.msg, resp, location: 'addPersonBD' }) : (0, errorController_1.rError)({ status: 500, msg: 'desconocido', resp });
});
exports.addPerson = addPerson;
const Enterprice = (req, resp) => __awaiter(void 0, void 0, void 0, function* () { });
exports.Enterprice = Enterprice;
const getGeneral = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Enterprices = yield (0, querysTecnicos_1.GetEnterprices)({});
        const Roles = yield (0, querysTecnicos_1.GetRoles)({});
        const ServicesTypes = yield (0, querysTecnicos_1.GetTypes)({});
        if (typeof (Enterprices) !== 'string' && typeof (Roles) !== 'string' && typeof (ServicesTypes) !== 'string') {
            return resp.status(200).json({
                status: true,
                data: {
                    Enterprices,
                    Roles,
                    ServicesTypes
                }
            });
        }
        else {
            let error = (typeof (Enterprices) === 'string' && typeof (Roles) === 'string') ? `No hay Empresas y Roles de persona registrados `
                : (typeof (Enterprices) === 'string') ? Enterprices : (typeof (Roles) === 'string') ? Roles : '';
            resp.status(500).json({
                status: false,
                errors: [
                    {
                        value: '',
                        msg: `Error en el servidor. Error: ${error}`,
                        location: 'getUsersMon',
                        param: '',
                    }
                ]
            });
        }
    }
    catch (error) {
        resp.status(500).json({
            status: false,
            errors: [
                {
                    value: '',
                    msg: `Error en el servidor. Error: ${error}`,
                    location: 'getUsersMon',
                    param: '',
                }
            ]
        });
    }
});
exports.getGeneral = getGeneral;
//# sourceMappingURL=adminController.js.map
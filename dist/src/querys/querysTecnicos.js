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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetService = exports.GetServices = exports.UpdatePerson = exports.UpdateTechnical = exports.UpdateService = exports.GetTechnicalInService = exports.GetActiveServices = exports.ExistTechnicalInService = exports.GetTechnicalsInServiceActive = exports.GetTypes = exports.GetDisponibleTechnical = exports.GetIndexService = exports.GetRoles = exports.GetPersonGeneral = exports.GetPersons = exports.GetEnterprices = exports.ExistEployeeNumber = exports.DeleteTechnicaltoService = exports.addPersonBD = exports.AddTechnicalService = exports.UserAccess = exports.AddService = exports.AddBinnacle = exports.AddComment = exports.AddPerson = void 0;
const mssql_1 = require("mssql");
const app_1 = require("../../app");
const uuid_1 = require("uuid");
const connection_1 = require("../db/connection");
const AddPerson = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_person', mssql_1.TYPES.VarChar(40), data.id_person)
        .input('id_enterprice', mssql_1.TYPES.SmallInt, data.id_enterprice)
        .input('id_role', mssql_1.TYPES.SmallInt, data.id_role)
        .input('name', mssql_1.TYPES.VarChar(30), data.name)
        .input('lastname', mssql_1.TYPES.VarChar(50), data.lastname)
        .input('email', mssql_1.TYPES.VarChar(50), data.email)
        .input('password', mssql_1.TYPES.Text, data.password)
        .input('phoneNumber', mssql_1.TYPES.VarChar(10), data.phoneNumber)
        .input('employeeNumber', mssql_1.TYPES.VarChar(20), data.employeeNumber)
        .query(`
            INSERT INTO Person 
                (id_person ,id_enterprice ,id_role ,name ,lastname ,email ,password ,phoneNumber ,employeeNumber)
            VALUES  
                (@id_person ,@id_enterprice ,@id_role ,@name ,@lastname ,@email ,@password ,@phoneNumber ,@employeeNumber)
            `)
        .then(() => {
        return { isInserted: true };
    })
        .catch(err => {
        return { isInserted: false, error: `${err}` };
    });
});
exports.AddPerson = AddPerson;
const AddComment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), data.id_service)
        .input('person', mssql_1.TYPES.Text, data.person)
        .input('comment', mssql_1.TYPES.Text, data.comment)
        .query(`
            INSERT INTO Comment 
                (id_service,person ,comment)
            VALUES  
                (@id_service,@person ,@comment)
            `)
        .then(() => {
        return { isInserted: true };
    })
        .catch(err => {
        return { isInserted: false, error: `${err}` };
    });
});
exports.AddComment = AddComment;
const AddBinnacle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), data.id_service)
        .input('zones', mssql_1.TYPES.Text, data.zones)
        .input('missingZones', mssql_1.TYPES.Text, data.missingZones)
        .input('zonesUndefined', mssql_1.TYPES.Text, data.zonesUndefined)
        .input('users', mssql_1.TYPES.Text, data.users)
        .input('missingUsers', mssql_1.TYPES.Text, data.missingUsers)
        .input('usersUndefined', mssql_1.TYPES.Text, data.usersUndefined)
        .input('link', mssql_1.TYPES.VarChar(20), data.link)
        .input('technicals', mssql_1.TYPES.Text, data.technicals)
        .query(`
                INSERT INTO Binnacle 
                    (id_service,zones,missingZones,zonesUndefined,users,missingUsers,usersUndefined,link,technicals)
                VALUES  
                    (@id_service,@zones,@missingZones,@zonesUndefined,@users,@missingUsers,@usersUndefined,@link,@technicals)
            `)
        .then(() => {
        return { isInserted: true };
    })
        .catch(err => {
        return { isInserted: false, error: `${err}` };
    });
});
exports.AddBinnacle = AddBinnacle;
const AddService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), data.id_service)
        .input('grantedEntry', mssql_1.TYPES.Text, data.grantedEntry)
        .input('id_type', mssql_1.TYPES.Numeric, data.id_type)
        .input('folio', mssql_1.TYPES.VarChar(50), data.folio)
        .input('entryDate', mssql_1.TYPES.DateTime, data.entryDate)
        .input('exitDate', mssql_1.TYPES.DateTime, data.exitDate)
        .input('accountMW', mssql_1.TYPES.VarChar, data.accountMW)
        .input('digital', mssql_1.TYPES.VarChar(10), data.digital)
        .input('nameAccount', mssql_1.TYPES.VarChar(100), data.nameAccount)
        .input('isKeyCode', mssql_1.TYPES.Bit, data.isKeyCode)
        .input('isOpCi', mssql_1.TYPES.Bit, data.isOpCi)
        .input('cron', mssql_1.TYPES.VarChar(20), data.cron)
        .query(`
                INSERT INTO Service
                    (id_service, grantedEntry, id_type, folio, entryDate, exitDate, accountMW, isKeyCode, isOpCi, cron, digital, nameAccount)
                VALUES
                    ( @id_service, @grantedEntry, @id_type, @folio, @entryDate, @exitDate, @accountMW, @isKeyCode, @isOpCi, @cron, @digital, @nameAccount)
            `)
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        (_a = app_1.server.Task) === null || _a === void 0 ? void 0 : _a.add(data.id_service, data.cron, false);
        return { isInserted: true };
    }))
        .catch(err => {
        return { isInserted: false, error: `${err}` };
    });
});
exports.AddService = AddService;
const UserAccess = (props) => __awaiter(void 0, void 0, void 0, function* () {
    if (Object.keys(props).length > 2)
        return { error: { status: 400, msg: `Propiedades invalidas ${Object.keys(props)}` } };
    const { id_user, deleteUser, exist, existWithoutThisPerson, insert, update, personHaveUser } = props;
    if (exist) {
        const { rowsAffected } = yield connection_1.pool1.request().query(`select * from UserAccess where nameUser COLLATE SQL_Latin1_General_CP1_CS_AS = '${exist.nameUser}'`);
        if (rowsAffected[0] !== 0)
            return { error: { status: 400, msg: (exist.id_role === 2) ? `El usuario de monitorista: ${exist.nameUser} ya existe` : `El usuario: ${exist.nameUser} ya existe` } };
        return { isExist: false };
    }
    if (existWithoutThisPerson) {
        const { rowsAffected: existUser } = yield connection_1.pool1.request()
            .input('id_user', mssql_1.TYPES.VarChar(40), id_user)
            .query(`select id_user from UserAccess where nameUser COLLATE SQL_Latin1_General_CP1_CS_AS = '${existWithoutThisPerson.nameUser}' and id_user != @id_user`);
        if (existUser[0] !== 0)
            return { error: { status: 400, msg: `El usuario:${existWithoutThisPerson.nameUser} ya existe` } };
        return { isExist: false }; //false significa que no existe el usuario
    }
    if (personHaveUser) {
        const { rowsAffected: isPersonHaveUser } = yield connection_1.pool1.request()
            .input('id_user', mssql_1.TYPES.VarChar(40), id_user)
            .query(`select id_user from UserAccess where id_user = @id_user`);
        if (isPersonHaveUser[0] === 0)
            return { isPersonHaveUser: false }; //No tiene usuario enUsers
        else
            return { isPersonHaveUser: true }; //Tiene usuario en users
    }
    if (insert) {
        const isInserted = yield connection_1.pool1.request()
            .input('id_user', mssql_1.TYPES.VarChar(40), id_user)
            .input('nameUser', mssql_1.TYPES.VarChar(20), insert.nameUser)
            .query(`INSERT INTO UserAccess (id_user,nameUser) VALUES (@id_user,@nameUser)`)
            .then(() => true)
            .catch(err => `${err}`);
        if (typeof (isInserted) === 'string')
            return { error: { status: 500, msg: isInserted } };
        return { isInserted };
    }
    if (update) {
        const isUpdated = yield connection_1.pool1.request()
            .input('id_user', mssql_1.TYPES.VarChar(40), id_user)
            .input('nameUser', mssql_1.TYPES.VarChar(20), update.nameUser)
            .query(`Update UserAccess set nameUser = @nameUser where id_user=@id_user`)
            .then(() => true)
            .catch(err => `${err}`);
        if (typeof (isUpdated) === 'string')
            return { error: { status: 500, msg: isUpdated } };
        return { isUpdated };
    }
    if (deleteUser) {
        const isDeleted = yield connection_1.pool1.request()
            .input('id_user', mssql_1.TYPES.VarChar(40), id_user)
            .query('delete UserAccess where id_user=@id_user').then(() => true)
            .catch(err => `${err}`);
        if (typeof (isDeleted) === 'string')
            return { error: { status: 500, msg: isDeleted } };
        return { isDeleted };
    }
});
exports.UserAccess = UserAccess;
const AddTechnicalService = (id_service, id_technical) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
        .input('id_technical', mssql_1.TYPES.VarChar(40), id_technical)
        .query(`INSERT INTO TechnicalService ( id_service, id_technical ) VALUES ( @id_service, @id_technical )`)
        .then(() => {
        return { isInserted: true };
    })
        .catch(err => {
        return { isInserted: false, error: `${err}` };
    });
});
exports.AddTechnicalService = AddTechnicalService;
const addPersonBD = (person) => __awaiter(void 0, void 0, void 0, function* () {
    const id_person = (0, uuid_1.v4)();
    const exist = yield (0, exports.GetPersonGeneral)({ id: id_person });
    const { enterprice, role, email, phoneNumber } = person, rest = __rest(person, ["enterprice", "role", "email", "phoneNumber"]);
    if (typeof (exist) === 'string')
        return { error: { status: 500, msg: exist } };
    if (exist === undefined) {
        const existEN = yield (0, exports.ExistEployeeNumber)({ id_enterprice: enterprice.id, employeeNumber: rest.employeeNumber });
        if (typeof (existEN) === 'string')
            return { error: { status: 500, msg: `${existEN}` } };
        if (existEN)
            return { error: { status: 400, msg: `El Codigo de empleado: ${rest.employeeNumber} ya existe` } };
        const obj = Object.assign({ id_person, email: (email === '') ? null : email, phoneNumber: (phoneNumber === '') ? null : phoneNumber, id_enterprice: enterprice.id, id_role: role.id }, rest);
        const { isInserted, error } = yield (0, exports.AddPerson)(Object.assign({}, obj));
        if (isInserted) {
            if (person.role.id === 2 || email === '') {
                // const { isInserted, error }: RespInsert = await AddUserAccess(id_person, person.role.user);
                const isInserted = yield (0, exports.UserAccess)({ id_user: id_person, insert: { nameUser: person.role.user } });
                if (isInserted === null || isInserted === void 0 ? void 0 : isInserted.error) {
                    yield connection_1.pool1.request().query(`delete Person where id_person = '${id_person}'`);
                    return { error: { status: 400, msg: `Error al insertar AddUserAccess Error: ${error}` } };
                }
                return { isInserted: { status: 200 } };
            }
            else
                return { isInserted: { status: 200 } };
        }
        else
            return { error: { status: 400, msg: `Error al insertar la persona Error: ${error}` } };
    }
    else
        return { error: { status: 400, msg: `Error al generar identificador unico Intente de nuevo` } };
});
exports.addPersonBD = addPersonBD;
const DeleteTechnicaltoService = (id_service, id_technical) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
        .input('id_technical', mssql_1.TYPES.VarChar(40), id_technical)
        .query(`delete TechnicalService where id_service=@id_service and id_technical=@id_technical`)
        .then(() => true)
        .catch(err => ` ${err}`);
});
exports.DeleteTechnicaltoService = DeleteTechnicaltoService;
const ExistEployeeNumber = ({ employeeNumber, id_enterprice, personExclude }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //true: existe el numero de empleado para esa empresa
        //false: no existe el numero de empleado para esa empresa
        const { rowsAffected } = yield connection_1.pool1.request()
            .input('id_enterprice', mssql_1.TYPES.SmallInt, id_enterprice)
            .input('employeeNumber', mssql_1.TYPES.VarChar(10), employeeNumber)
            .query(`select * from Person where id_enterprice = @id_enterprice and employeeNumber = @employeeNumber ${personExclude ? `and id_person != '${personExclude}'` : ''}`);
        return (rowsAffected[0] !== 0) ? true : false;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.ExistEployeeNumber = ExistEployeeNumber;
const GetEnterprices = ({ enterprice, shortName }) => __awaiter(void 0, void 0, void 0, function* () {
    if (shortName && enterprice)
        return `Solo se debe mandar una opción de busqueda`;
    let query = (enterprice) ? `select * from Enterprice ${enterprice ? `where id_enterprice=${enterprice.id_enterprice} and shortName='${enterprice.shortName}'` : ''}` :
        (shortName) ? `select * from Enterprice where shortName='${shortName}'` :
            'select * from Enterprice';
    try {
        const { recordset: Enterprices } = yield connection_1.pool1.request().query(query);
        return Enterprices;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetEnterprices = GetEnterprices;
const GetPersons = (role, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    let query = '';
    if (role === 850827) {
        query =
            `
                select P.id_person, E.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name as personName,P.lastname,P.email,p.phoneNumber,P.employeeNumber,P.status, UA.nameUser 
                from Person P
                left join Enterprice E on P.id_enterprice= E.id_enterprice
                left join UserAccess UA on UA.id_user=P.id_person
            `;
    }
    else {
        query =
            `
                select P.id_person, E.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name as personName,P.lastname,P.email,p.phoneNumber,P.employeeNumber,P.status, UA.nameUser 
                from Person P
                left join Enterprice E on P.id_enterprice= E.id_enterprice
                left join UserAccess UA on UA.id_user=P.id_person
                where id_role = ${role} ${(isActive) ? `and P.status='ACTIVO'` : ''}
            `;
    }
    try {
        const { recordset: Persons } = yield connection_1.pool1.request().query(query);
        return Persons;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetPersons = GetPersons;
const GetPersonGeneral = ({ id, role, email, user, inactive }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset: Person } = yield connection_1.pool1.request().query(`
                select P.id_person, E.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name as personName,P.lastname,P.email,P.password,p.phoneNumber,P.employeeNumber,P.status, UA.nameUser 
                from Person P
                left join Enterprice E on P.id_enterprice= E.id_enterprice
                left join UserAccess UA on UA.id_user=P.id_person
                ${(inactive) ? `where P.status='INACTIVO'` : `where P.status='ACTIVO'`}
                ${(id) ? ` and P.id_person='${id}'` : ''}
                ${(role) ? ` and P.id_role = ${role}` : ''}
                ${(email) ? ` and P.email = '${email}'` : ''}
                ${(user) ? ` and UA.nameUser COLLATE SQL_Latin1_General_CP1_CS_AS ='${user}'` : ''}
            `);
        return Person[0];
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetPersonGeneral = GetPersonGeneral;
const GetRoles = ({ id_role, role }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (id_role && role)
            throw (`Parametros erroneos, solo se puede consultar un solo paramatro a la vez`);
        let query = (id_role) ? `select * from Role where id_role = ${id_role}` : (role) ? `select * from Role where id_role = ${role.id_role} and name='${role.name}'` : 'select * from Role';
        const { recordset: Roles } = yield connection_1.pool1.request().query(query);
        return Roles;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetRoles = GetRoles;
const GetIndexService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset } = yield connection_1.pool1.request().query(`select count(*) as idx from Service`);
        return recordset[0].idx + 1;
    }
    catch (error) {
        return ` ${error}`;
    }
});
exports.GetIndexService = GetIndexService;
const GetDisponibleTechnical = () => __awaiter(void 0, void 0, void 0, function* () {
    const technicals = yield (0, exports.GetPersons)(1, true);
    if (typeof (technicals) === 'string')
        return `${technicals}`;
    const technicalsInService = yield (0, exports.GetTechnicalsInServiceActive)();
    if (typeof (technicalsInService) === 'string')
        return `${technicalsInService}`;
    const DisponibleTechnical = technicals.filter(t => { var _a; return t.id_person !== ((_a = technicalsInService.find(f => f.id_person === t.id_person)) === null || _a === void 0 ? void 0 : _a.id_person); });
    return DisponibleTechnical;
});
exports.GetDisponibleTechnical = GetDisponibleTechnical;
const GetTypes = ({ id_type, name }) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (id_type && name) ? `select * from TypeService where id_type = ${id_type} and name = '${name}'`
        : (id_type) ? `select * from TypeService where id_type = ${id_type}`
            : (name) ? `select * from TypeService where name = '${name}'`
                : 'select * from TypeService';
    try {
        const { recordset: Types } = yield connection_1.pool1.request().query(query);
        return Types;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetTypes = GetTypes;
const GetTechnicalsInServiceActive = (id_service) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset: Technicals } = yield connection_1.pool1.request()
            .query(`
                    select TS.id_technical as id_person, P.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name  as personName,P.lastname,P.email,P.password,P.phoneNumber,P.employeeNumber,P.status,UA.nameUser,TS.withOutFolio, S.id_service
                    from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive = 'true' ${(id_service) ? `and S.id_service = '${id_service}' ` : ''}
                `);
        return Technicals;
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetTechnicalsInServiceActive = GetTechnicalsInServiceActive;
const ExistTechnicalInService = (id_technical) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset: Technical } = yield connection_1.pool1.request()
            .input('id_technical', mssql_1.TYPES.VarChar(40), id_technical)
            .query(`
                    select TS.id_technical as id_person, P.id_enterprice,P.id_role,E.shortName,P.name,P.lastname,P.phoneNumber,P.employeeNumber,P.status,UA.nameUser from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive='true' and id_technical=@id_technical
                `);
        return Technical[0];
    }
    catch (error) {
        return `${error}`;
    }
});
exports.ExistTechnicalInService = ExistTechnicalInService;
const GetActiveServices = ({ service }) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (service) ? `Select * from Service where id_service = '${service.id_service}' ${(service.selected) ? '' : ` and isActive = 'true'`} ` : `Select * from Service where isActive = 'true'`;
    try {
        const { recordset } = yield connection_1.pool1.request()
            .input('id_service', mssql_1.TYPES.VarChar(40), (service) ? service.selected : '')
            .query(query);
        return recordset;
    }
    catch (error) {
        return ` ${error}`;
    }
});
exports.GetActiveServices = GetActiveServices;
const GetTechnicalInService = (id_technical) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset: Technical } = yield connection_1.pool1.request()
            .input('id_technical', mssql_1.TYPES.VarChar(40), id_technical)
            .query(`
                    select S.*,TS.withOutFolio from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive='true' and id_technical=@id_technical
                `);
        return Technical[0];
    }
    catch (error) {
        return `${error}`;
    }
});
exports.GetTechnicalInService = GetTechnicalInService;
const UpdateService = ({ id_service, prop, interno, selected }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
        .query(`UPDATE Service set ${prop} where id_service = @id_service`)
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        if (interno) {
            return true;
        }
        else {
            // const service = await GetActiveService(id_service, selected);
            const service = yield (0, exports.GetActiveServices)({ service: { id_service, selected } });
            if (typeof (service) === 'string')
                throw new Error(`${service}`);
            // if (service === undefined) throw new Error("Servicio no existe");
            if (service.length === 0)
                throw new Error("Servicio no existe");
            if (selected === undefined) {
                const technicals = yield (0, exports.GetTechnicalsInServiceActive)(id_service);
                if (typeof (technicals) === 'string')
                    throw new Error(`${technicals}`);
                return { service: service[0], technicals };
            }
            return { service: service[0], technicals: [] };
        }
    }))
        .catch(err => { return ` ${err}`; });
});
exports.UpdateService = UpdateService;
const UpdateTechnical = ({ id_service, id_person, prop }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield connection_1.pool1.request()
        .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
        .input('id_person', mssql_1.TYPES.VarChar(40), id_person)
        .query(`UPDATE TechnicalService SET ${prop} WHERE id_service = @id_service AND id_technical = @id_person`)
        .then(() => __awaiter(void 0, void 0, void 0, function* () { return true; }))
        .catch(err => { return `${err}`; });
});
exports.UpdateTechnical = UpdateTechnical;
const UpdatePerson = ({ id_person, prop, data }) => __awaiter(void 0, void 0, void 0, function* () {
    if (id_person && prop && data)
        return `formato de propiedades invalidas`;
    if (id_person && data) {
        const { email, employeeNumber, lastname, password, personName, phoneNumber } = data;
        return yield connection_1.pool1.request()
            .input('id_person', mssql_1.TYPES.VarChar(40), id_person)
            .input('name', mssql_1.TYPES.VarChar(30), personName)
            .input('lastname', mssql_1.TYPES.VarChar(50), lastname)
            .input('email', mssql_1.TYPES.VarChar(50), email)
            .input('password', mssql_1.TYPES.Text, password)
            .input('phoneNumber', mssql_1.TYPES.VarChar(10), phoneNumber)
            .input('employeeNumber', mssql_1.TYPES.VarChar(20), employeeNumber)
            .query(`
                    update Person set 
                        name = @name,
                        lastname = @lastname,
                        email = ${email !== '' ? '@email' : 'NULL'},
                        phoneNumber = ${phoneNumber !== '' ? '@phoneNumber' : 'NULL'},
                        password = @password,
                        employeeNumber = @employeeNumber
                    where id_person = @id_person
                `)
            .then(() => __awaiter(void 0, void 0, void 0, function* () { return true; }))
            .catch(err => `${err}`);
    }
    if (id_person && prop) {
        return yield connection_1.pool1.request()
            .input('id_person', mssql_1.TYPES.VarChar(40), id_person)
            .query(`UPDATE Person set ${prop} where id_person = @id_person`)
            .then(() => __awaiter(void 0, void 0, void 0, function* () { return true; }))
            .catch(err => { return `${err}`; });
    }
    return `Ningun caso sontemplado`;
});
exports.UpdatePerson = UpdatePerson;
const GetServices = ({ end, start, account, technical }) => __awaiter(void 0, void 0, void 0, function* () {
    if (technical) {
        const person = yield (0, exports.GetPersonGeneral)({ id: technical });
        if (typeof person === 'string')
            return person;
        if (person === undefined)
            return `técnico no existe`;
        const { recordset } = yield connection_1.pool1.request()
            .input('id_technical', mssql_1.TYPES.VarChar(40), person.id_person)
            .query(`
                    SELECT S.id_service,S.folio,S.entryDate,S.exitDate,S.accountMW,S.isActive,S.digital,S.nameAccount,S.isDelivered FROM TechnicalService TS 
                    LEFT JOIN Service S ON S.id_service=TS.id_service 
                    WHERE
                    id_technical=@id_technical AND 
                    entryDate between '${start} 00:00:00' AND '${end} 23:59:59'
                    order by entryDate desc
                `);
        return recordset;
    }
    const { recordset } = yield connection_1.pool1.request()
        .query(`
                SELECT S.id_service,folio,entryDate,exitDate,accountMW,isActive,digital,nameAccount,B.technicals FROM Service S
                LEFT JOIN Binnacle B ON B.id_service=S.id_service 
                WHERE 
                entryDate BETWEEN '${start} 00:00:00' AND '${end} 23:59:59'
                ${account ? `AND accountMW = '${account}'` : ''}
                order by entryDate desc
            `);
    return recordset;
});
exports.GetServices = GetServices;
const GetService = ({ id_service }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordset: binnacle } = yield connection_1.pool1.request()
            .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
            .query(`SELECT * FROM Binnacle WHERE id_service = @id_service`);
        const { recordset: comments } = yield connection_1.pool1.request()
            .input('id_service', mssql_1.TYPES.VarChar(40), id_service)
            .query(`SELECT * FROM Comment WHERE id_service= @id_service`);
        return { binnacle, comments };
    }
    catch (error) {
        return ` ${error}`;
    }
});
exports.GetService = GetService;
//# sourceMappingURL=querysTecnicos.js.map
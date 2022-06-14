import { TYPES, IResult } from 'mssql';
import { server } from '../../app';
import { Person, PropsAddBinnacle, PropsAddComment, PropsAddPerson, PropsAddService, updatePersonProps, updateService, updateTechnical, bodyPerson, RespInsert, respGetServiceFiltered } from '../rules/interfaces';
import { Role, Service, TypeService, Binnacle, Comment } from '../rules/response';
import { v4 as uuidv4 } from 'uuid';
import { pool1 } from '../db/connection';

/**
 * @typedef {Object} PropsAddPerson
 * @property {string} id_person id único
 * @property {number} id_enterprice id de empresa
 * @property {number} id_role id rol que desempeña
 * @property {string} name Nombre de la persona
 * @property {string} lastname Apellidos de la persona
 * @property {string | null} email Correo
 * @property {string} password Contraseña
 * @property {string | null} phoneNumber Número telefónico
 * @property {string} employeeNumber Número de empleado
 */

/**
 * @typedef {Object} PropsAddBinnacle
 * @property {string} id_service id único
 * @property {string} zones JSON convertido a string
 * @property {string} missingZones JSON convertido a string
 * @property {string} zonesUndefined JSON convertido a string
 * @property {string} users JSON convertido a string
 * @property {string} missingUsers JSON convertido a string
 * @property {string} usersUndefined JSON convertido a string
 * @property {string} link Estado del enlace
 * @property {string} technicals Arreglo convertido a string
 */

/**
 * @typedef {Object} PropsAddService
 * @property {string} id_service
 * @property {string} grantedEntry
 * @property {number} id_type
 * @property {string} folio
 * @property {Date} entryDate
 * @property {Date} exitDate
 * @property {string} accountMW
 * @property {string} digital
 * @property {string} nameAccount
 * @property {boolean} isKeyCode
 * @property {boolean} isOpCi
 * @property {string} cron
 */

/**
 * @typedef {Object} Body
 */

/**
 * @typedef {Object} RespUserAccess
 * @property {Object<{status:number, msg:string}>} [error] Si se hubo algún error
 * @property {boolean} [isExist] si existe el usuario mandado
 * @property {boolean} [isPersonHaveUser] si el usuario mandado le pertenece a la persona ingresada
 * @property {boolean} [isInserted] si la persona inserto un dato correctamente
 * @property {boolean} [isUpdated] si  los datos de la persona fuerpn actuaizados correctamente
 * @property {boolean} [isDeleted] si la persona fue eliminada correctamente
 */

/**@module CONSULTAS_BD_TECNICOS */

/**
 * Agrega una persona a la base de datos
 * @param {PropsAddPerson} data 
 * @returns {Promise<{ isInserted: boolean} | { isInserted: boolean, error: string }>}
 */
export const AddPerson = async (data: PropsAddPerson) => {
    return await pool1.request()
        .input('id_person', TYPES.VarChar(40), data.id_person)
        .input('id_enterprice', TYPES.SmallInt, data.id_enterprice)
        .input('id_role', TYPES.SmallInt, data.id_role)
        .input('name', TYPES.VarChar(30), data.name)
        .input('lastname', TYPES.VarChar(50), data.lastname)
        .input('email', TYPES.VarChar(50), data.email)
        .input('password', TYPES.Text, data.password)
        .input('phoneNumber', TYPES.VarChar(10), data.phoneNumber)
        .input('employeeNumber', TYPES.VarChar(20), data.employeeNumber)
        .query(
            `
            INSERT INTO Person 
                (id_person ,id_enterprice ,id_role ,name ,lastname ,email ,password ,phoneNumber ,employeeNumber)
            VALUES  
                (@id_person ,@id_enterprice ,@id_role ,@name ,@lastname ,@email ,@password ,@phoneNumber ,@employeeNumber)
            `
        )
        .then(() => {
            return { isInserted: true }
        })
        .catch(err => {
            return { isInserted: false, error: `${err}` }
        })
}

/**
 * Agrega un comentario a un servicio
 * @param {Object<{id_service: string, person: string, comment: string}>} data Datos del comentario
 * @returns { Promise<{ isInserted: boolean } | {isInserted: boolean, error: string }> }
 */
export const AddComment = async (data: PropsAddComment) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), data.id_service)
        .input('person', TYPES.Text, data.person)
        .input('comment', TYPES.Text, data.comment)
        .query(
            `
            INSERT INTO Comment 
                (id_service,person ,comment)
            VALUES  
                (@id_service,@person ,@comment)
            `
        )
        .then(() => {
            return { isInserted: true }
        })
        .catch(err => {
            return { isInserted: false, error: `${err}` }
        })
}

/**
 * Agrega la bitácora del servicio cuando ya se ha liberado
 * @param {PropsAddBinnacle} data Datos de la bitácora
 * @returns {Promise<{ isInserted: boolean} | { isInserted: boolean, error: string }>} 
 */
export const AddBinnacle = async (data: PropsAddBinnacle) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), data.id_service)
        .input('zones', TYPES.Text, data.zones)
        .input('missingZones', TYPES.Text, data.missingZones)
        .input('zonesUndefined', TYPES.Text, data.zonesUndefined)
        .input('users', TYPES.Text, data.users)
        .input('missingUsers', TYPES.Text, data.missingUsers)
        .input('usersUndefined', TYPES.Text, data.usersUndefined)
        .input('link', TYPES.VarChar(20), data.link)
        .input('technicals', TYPES.Text, data.technicals)
        .query(
            `
                INSERT INTO Binnacle 
                    (id_service,zones,missingZones,zonesUndefined,users,missingUsers,usersUndefined,link,technicals)
                VALUES  
                    (@id_service,@zones,@missingZones,@zonesUndefined,@users,@missingUsers,@usersUndefined,@link,@technicals)
            `
        )
        .then(() => {
            return { isInserted: true }
        })
        .catch(err => {
            return { isInserted: false, error: `${err}` }
        })
}

/**
 * Agrega un nuevo servicio
 * @param {PropsAddService} data 
 * @returns {Promise<{ isInserted: boolean} | { isInserted: boolean, error: string }>} 
 */
export const AddService = async (data: PropsAddService) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), data.id_service)
        .input('grantedEntry', TYPES.Text, data.grantedEntry)
        .input('id_type', TYPES.Numeric, data.id_type)
        .input('folio', TYPES.VarChar(50), data.folio)
        .input('entryDate', TYPES.DateTime, data.entryDate)
        .input('exitDate', TYPES.DateTime, data.exitDate)
        .input('accountMW', TYPES.VarChar, data.accountMW)
        .input('digital', TYPES.VarChar(10), data.digital)
        .input('nameAccount', TYPES.VarChar(100), data.nameAccount)
        .input('isKeyCode', TYPES.Bit, data.isKeyCode)
        .input('isOpCi', TYPES.Bit, data.isOpCi)
        .input('cron', TYPES.VarChar(20), data.cron)
        .query(
            `
                INSERT INTO Service
                    (id_service, grantedEntry, id_type, folio, entryDate, exitDate, accountMW, isKeyCode, isOpCi, cron, digital, nameAccount)
                VALUES
                    ( @id_service, @grantedEntry, @id_type, @folio, @entryDate, @exitDate, @accountMW, @isKeyCode, @isOpCi, @cron, @digital, @nameAccount)
            `
        )
        .then(async () => {
            server.Task?.add(data.id_service, data.cron, false);
            return { isInserted: true }
        })
        .catch(err => {
            return { isInserted: false, error: `${err}` }
        })
}

/**
 * Proceso que hace la verifiación de usuarios registrados al momento de actualizar alguna persona, eliminacion de una persona y actualización de datos de la persona
 * @param {Object} props { id_user: string | null; insert?: { nameUser: string; }; deleteUser?: boolean; update?: { nameUser: string; }; exist?: { nameUser: string; id_role?: number; }; existWithoutThisPerson?: { nameUser: string; }; personHaveUser?: { nameUser: string; }; }
 * @returns {Promise<RespUserAccess>}
 */
export const UserAccess = async (props: { id_user: string | null, insert?: { nameUser: string; }, deleteUser?: boolean, update?: { nameUser: string; }, exist?: { nameUser: string, id_role?: number }, existWithoutThisPerson?: { nameUser: string; }, personHaveUser?: { nameUser: string; } }) => {
    if (Object.keys(props).length > 2) return { error: { status: 400, msg: `Propiedades invalidas ${Object.keys(props)}` } };

    const { id_user, deleteUser, exist, existWithoutThisPerson, insert, update, personHaveUser } = props;

    if (exist) {
        const { rowsAffected } = await pool1.request().query(`select * from UserAccess where nameUser COLLATE SQL_Latin1_General_CP1_CS_AS = '${exist.nameUser}'`);
        if (rowsAffected[0] !== 0) return { error: { status: 400, msg: (exist.id_role === 2) ? `El usuario de monitorista: ${exist.nameUser} ya existe` : `El usuario: ${exist.nameUser} ya existe` } };
        return { isExist: false }
    }

    if (existWithoutThisPerson) {
        const { rowsAffected: existUser } = await pool1.request()
            .input('id_user', TYPES.VarChar(40), id_user)
            .query(`select id_user from UserAccess where nameUser COLLATE SQL_Latin1_General_CP1_CS_AS = '${existWithoutThisPerson.nameUser}' and id_user != @id_user`);
        if (existUser[0] !== 0) return { error: { status: 400, msg: `El usuario:${existWithoutThisPerson.nameUser} ya existe` } };
        return { isExist: false }//false significa que no existe el usuario
    }

    if (personHaveUser) {
        const { rowsAffected: isPersonHaveUser } = await pool1.request()
            .input('id_user', TYPES.VarChar(40), id_user)
            .query(`select id_user from UserAccess where id_user = @id_user`);
        if (isPersonHaveUser[0] === 0) return { isPersonHaveUser: false }//No tiene usuario enUsers
        else return { isPersonHaveUser: true }//Tiene usuario en users
    }

    if (insert) {
        const isInserted = await pool1.request()
            .input('id_user', TYPES.VarChar(40), id_user)
            .input('nameUser', TYPES.VarChar(20), insert.nameUser)
            .query(`INSERT INTO UserAccess (id_user,nameUser) VALUES (@id_user,@nameUser)`)
            .then(() => true)
            .catch(err => `${err}`);
        if (typeof (isInserted) === 'string') return { error: { status: 500, msg: isInserted } }
        return { isInserted }
    }

    if (update) {
        const isUpdated = await pool1.request()
            .input('id_user', TYPES.VarChar(40), id_user)
            .input('nameUser', TYPES.VarChar(20), update.nameUser)
            .query(`Update UserAccess set nameUser = @nameUser where id_user=@id_user`)
            .then(() => true)
            .catch(err => `${err}`);
        if (typeof (isUpdated) === 'string') return { error: { status: 500, msg: isUpdated } }
        return { isUpdated }
    }

    if (deleteUser) {
        const isDeleted = await pool1.request()
            .input('id_user', TYPES.VarChar(40), id_user)
            .query('delete UserAccess where id_user=@id_user').then(() => true)
            .catch(err => `${err}`);
        if (typeof (isDeleted) === 'string') return { error: { status: 500, msg: isDeleted } }
        return { isDeleted }
    }

}

/**
 * 
 * @param {String} id_service id del servicio. (Debe ser un servicio activo )
 * @param {String} id_technical id del técnico. (Debe ser un técnico disponible; no asignado a un servicio).
 * @returns {Promise<{ isInserted: boolean } | { isInserted: boolean, error: string }>}
 */
export const AddTechnicalService = async (id_service: string, id_technical: string) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), id_service)
        .input('id_technical', TYPES.VarChar(40), id_technical)
        .query(`INSERT INTO TechnicalService ( id_service, id_technical ) VALUES ( @id_service, @id_technical )`)
        .then(() => {
            return { isInserted: true }
        })
        .catch(err => {
            return { isInserted: false, error: `${err}` }
        })
}

/**
 * Agrega una persona a la base de datos
 * @param person 
 * @returns {Promise<{ error: { status: number, msg: string }, isInserted: undefined } | { isInserted: { status: number }, error: undefined }>}
 */
export const addPersonBD = async (person: bodyPerson) => {
    const id_person = uuidv4();
    const exist = await GetPersonGeneral({ id: id_person });
    const { enterprice, role, email, phoneNumber, ...rest } = person;
    if (typeof (exist) === 'string') return { error: { status: 500, msg: exist } };
    if (exist === undefined) {
        const existEN = await ExistEployeeNumber({ id_enterprice: enterprice.id, employeeNumber: rest.employeeNumber });
        if (typeof (existEN) === 'string') return { error: { status: 500, msg: `${existEN}` } };
        if (existEN) return { error: { status: 400, msg: `El Codigo de empleado: ${rest.employeeNumber} ya existe` } };
        const obj = { id_person, email: (email === '') ? null : email, phoneNumber: (phoneNumber === '') ? null : phoneNumber, id_enterprice: enterprice.id, id_role: role.id, ...rest }
        const { isInserted, error }: RespInsert = await AddPerson({ ...obj });
        if (isInserted) {
            if (person.role.id === 2 || email === '') {
                // const { isInserted, error }: RespInsert = await AddUserAccess(id_person, person.role.user);
                const isInserted = await UserAccess({ id_user: id_person, insert: { nameUser: person.role.user } });
                if (isInserted?.error) {
                    await pool1.request().query(`delete Person where id_person = '${id_person}'`);
                    return { error: { status: 400, msg: `Error al insertar AddUserAccess Error: ${error}` } };
                }
                return { isInserted: { status: 200 } };
            } else return { isInserted: { status: 200 } };
        } else return { error: { status: 400, msg: `Error al insertar la persona Error: ${error}` } };
    } else return { error: { status: 400, msg: `Error al generar identificador unico Intente de nuevo` } };
}

export const DeleteTechnicaltoService = async (id_service: string, id_technical: string) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), id_service)
        .input('id_technical', TYPES.VarChar(40), id_technical)
        .query(`delete TechnicalService where id_service=@id_service and id_technical=@id_technical`)
        .then(() => true)
        .catch(err => ` ${err}`);
}

export const ExistEployeeNumber = async ({ employeeNumber, id_enterprice, personExclude }: { id_enterprice: number, employeeNumber: string, personExclude?: string }) => {
    try {
        //true: existe el numero de empleado para esa empresa
        //false: no existe el numero de empleado para esa empresa
        const { rowsAffected }: IResult<Array<number>> = await pool1.request()
            .input('id_enterprice', TYPES.SmallInt, id_enterprice)
            .input('employeeNumber', TYPES.VarChar(10), employeeNumber)
            .query(`select * from Person where id_enterprice = @id_enterprice and employeeNumber = @employeeNumber ${personExclude ? `and id_person != '${personExclude}'` : ''}`);
        return (rowsAffected[0] !== 0) ? true : false;
    } catch (error) {
        return `${error}`;
    }
}

export const GetEnterprices = async ({ enterprice, shortName }: { enterprice?: { id_enterprice: number, shortName: string }, shortName?: string }) => {
    if (shortName && enterprice) return `Solo se debe mandar una opción de busqueda`;
    let query: string =
        (enterprice) ? `select * from Enterprice ${enterprice ? `where id_enterprice=${enterprice.id_enterprice} and shortName='${enterprice.shortName}'` : ''}` :
            (shortName) ? `select * from Enterprice where shortName='${shortName}'` :
                'select * from Enterprice';
    try {
        const { recordset: Enterprices } = await pool1.request().query(query);
        return Enterprices;
    } catch (error) {
        return `${error}`;
    }
}

export const GetPersons = async (role: number, isActive?: boolean) => {
    let query: string = '';
    if (role === 850827) {
        query =
            `
                select P.id_person, E.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name as personName,P.lastname,P.email,p.phoneNumber,P.employeeNumber,P.status, UA.nameUser 
                from Person P
                left join Enterprice E on P.id_enterprice= E.id_enterprice
                left join UserAccess UA on UA.id_user=P.id_person
            `;
    } else {
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
        const { recordset: Persons }: IResult<Person> = await pool1.request().query(query);
        return Persons;
    } catch (error) {
        return `${error}`;
    }
}

export const GetPersonGeneral = async ({ id, role, email, user, inactive }: { id?: string, role?: number, email?: string, user?: string, inactive?: 'INACTIVO' }) => {
    try {
        const { recordset: Person }: IResult<Person> = await pool1.request().query(
            `
                select P.id_person, E.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name as personName,P.lastname,P.email,P.password,p.phoneNumber,P.employeeNumber,P.status, UA.nameUser 
                from Person P
                left join Enterprice E on P.id_enterprice= E.id_enterprice
                left join UserAccess UA on UA.id_user=P.id_person
                ${(inactive) ? `where P.status='INACTIVO'` : `where P.status='ACTIVO'`}
                ${(id) ? ` and P.id_person='${id}'` : ''}
                ${(role) ? ` and P.id_role = ${role}` : ''}
                ${(email) ? ` and P.email = '${email}'` : ''}
                ${(user) ? ` and UA.nameUser COLLATE SQL_Latin1_General_CP1_CS_AS ='${user}'` : ''}
            `
        );
        return Person[0];
    } catch (error) { return `${error}` }
}

export const GetRoles = async ({ id_role, role }: { role?: { id_role: number, name: string }, id_role?: number }) => {
    try {
        if (id_role && role) throw (`Parametros erroneos, solo se puede consultar un solo paramatro a la vez`)
        let query: string = (id_role) ? `select * from Role where id_role = ${id_role}` : (role) ? `select * from Role where id_role = ${role.id_role} and name='${role.name}'` : 'select * from Role';
        const { recordset: Roles }: IResult<Role> = await pool1.request().query(query);
        return Roles;
    } catch (error) {
        return `${error}`;
    }
}

export const GetIndexService = async () => {
    try {
        const { recordset }: IResult<{ idx: number }> = await pool1.request().query(`select count(*) as idx from Service`);
        return recordset[0].idx + 1;
    } catch (error) {
        return ` ${error}`;
    }
}

export const GetDisponibleTechnical = async () => {
    const technicals = await GetPersons(1, true);
    if (typeof (technicals) === 'string')
        return `${technicals}`;

    const technicalsInService = await GetTechnicalsInServiceActive();
    if (typeof (technicalsInService) === 'string')
        return `${technicalsInService}`;

    const DisponibleTechnical: Array<Person> = technicals.filter(t => t.id_person !== technicalsInService.find(f => f.id_person === t.id_person)?.id_person);
    return DisponibleTechnical;
}

export const GetTypes = async ({ id_type, name }: { id_type?: number, name?: string }) => {
    const query: string =
        (id_type && name) ? `select * from TypeService where id_type = ${id_type} and name = '${name}'`
            : (id_type) ? `select * from TypeService where id_type = ${id_type}`
                : (name) ? `select * from TypeService where name = '${name}'`
                    : 'select * from TypeService';
    try {
        const { recordset: Types }: IResult<TypeService> = await pool1.request().query(query);
        return Types;
    } catch (error) {
        return `${error}`;
    }
}

export const GetTechnicalsInServiceActive = async (id_service?: string) => {
    try {
        const { recordset: Technicals }: IResult<Person> = await pool1.request()
            .query(
                `
                    select TS.id_technical as id_person, P.id_enterprice,P.id_role,E.shortName as enterpriceShortName,P.name  as personName,P.lastname,P.email,P.password,P.phoneNumber,P.employeeNumber,P.status,UA.nameUser,TS.withOutFolio, S.id_service
                    from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive = 'true' ${(id_service) ? `and S.id_service = '${id_service}' ` : ''}
                `
            );
        return Technicals;
    } catch (error) {
        return `${error}`
    }
}

export const ExistTechnicalInService = async (id_technical: string) => {
    try {
        const { recordset: Technical }: IResult<Person> = await pool1.request()
            .input('id_technical', TYPES.VarChar(40), id_technical)
            .query(
                `
                    select TS.id_technical as id_person, P.id_enterprice,P.id_role,E.shortName,P.name,P.lastname,P.phoneNumber,P.employeeNumber,P.status,UA.nameUser from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive='true' and id_technical=@id_technical
                `
            );
        return Technical[0];
    } catch (error) {
        return `${error}`;
    }
}

export const GetActiveServices = async ({ service }: { service?: { id_service: string, selected?: boolean } }) => {
    const query: string = (service) ? `Select * from Service where id_service = '${service.id_service}' ${(service.selected) ? '' : ` and isActive = 'true'`} ` : `Select * from Service where isActive = 'true'`;
    try {
        const { recordset }: IResult<Service> = await pool1.request()
            .input('id_service', TYPES.VarChar(40), (service) ? service.selected : '')
            .query(query);
        return recordset;
    } catch (error) {
        return ` ${error}`;
    }
}

export const GetTechnicalInService = async (id_technical: string) => {
    try {
        const { recordset: Technical }: IResult<Service> = await pool1.request()
            .input('id_technical', TYPES.VarChar(40), id_technical)
            .query(
                `
                    select S.*,TS.withOutFolio from TechnicalService TS
                    left join Service S on TS.id_service = S.id_service
                    left join Person P on P.id_person=TS.id_technical
                    left join Enterprice E on E.id_enterprice= P.id_enterprice
                    left join UserAccess UA on UA.id_user= TS.id_service
                    where S.isActive='true' and id_technical=@id_technical
                `
            );
        return Technical[0];
    } catch (error) {
        return `${error}`;
    }
}

export const UpdateService = async ({ id_service, prop, interno, selected }: updateService) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), id_service)
        .query(`UPDATE Service set ${prop} where id_service = @id_service`)
        .then(async () => {
            if (interno) {
                return true
            } else {
                // const service = await GetActiveService(id_service, selected);
                const service = await GetActiveServices({ service: { id_service, selected } });
                if (typeof (service) === 'string') throw new Error(`${service}`);
                // if (service === undefined) throw new Error("Servicio no existe");
                if (service.length === 0) throw new Error("Servicio no existe");
                if (selected === undefined) {
                    const technicals = await GetTechnicalsInServiceActive(id_service);
                    if (typeof (technicals) === 'string')
                        throw new Error(`${technicals}`);
                    return { service: service[0], technicals };
                }
                return { service: service[0], technicals: [] }
            }
        })
        .catch(err => { return ` ${err}`; });
}

export const UpdateTechnical = async ({ id_service, id_person, prop }: updateTechnical) => {
    return await pool1.request()
        .input('id_service', TYPES.VarChar(40), id_service)
        .input('id_person', TYPES.VarChar(40), id_person)
        .query(`UPDATE TechnicalService SET ${prop} WHERE id_service = @id_service AND id_technical = @id_person`)
        .then(async () => { return true })
        .catch(err => { return `${err}`; });
}

export const UpdatePerson = async ({ id_person, prop, data }: updatePersonProps) => {
    if (id_person && prop && data) return `formato de propiedades invalidas`;
    if (id_person && data) {
        const { email, employeeNumber, lastname, password, personName, phoneNumber } = data;
        return await pool1.request()
            .input('id_person', TYPES.VarChar(40), id_person)
            .input('name', TYPES.VarChar(30), personName)
            .input('lastname', TYPES.VarChar(50), lastname)
            .input('email', TYPES.VarChar(50), email)
            .input('password', TYPES.Text, password)
            .input('phoneNumber', TYPES.VarChar(10), phoneNumber)
            .input('employeeNumber', TYPES.VarChar(20), employeeNumber)
            .query(
                `
                    update Person set 
                        name = @name,
                        lastname = @lastname,
                        email = ${email !== '' ? '@email' : 'NULL'},
                        phoneNumber = ${phoneNumber !== '' ? '@phoneNumber' : 'NULL'},
                        password = @password,
                        employeeNumber = @employeeNumber
                    where id_person = @id_person
                `
            )
            .then(async () => true)
            .catch(err => `${err}`);
    }
    if (id_person && prop) {
        return await pool1.request()
            .input('id_person', TYPES.VarChar(40), id_person)
            .query(`UPDATE Person set ${prop} where id_person = @id_person`)
            .then(async () => { return true })
            .catch(err => { return `${err}`; });
    }
    return `Ningun caso sontemplado`;
}

export const GetServices = async ({ end, start, account, technical }: { start: string, end: string, technical?: string, account?: string }) => {
    if (technical) {
        const person = await GetPersonGeneral({ id: technical });
        if (typeof person === 'string') return person;
        if (person === undefined) return `técnico no existe`;

        const { recordset }: IResult<respGetServiceFiltered> = await pool1.request()
            .input('id_technical', TYPES.VarChar(40), person.id_person)
            .query(
                `
                    SELECT S.id_service,S.folio,S.entryDate,S.exitDate,S.accountMW,S.isActive,S.digital,S.nameAccount,S.isDelivered FROM TechnicalService TS 
                    LEFT JOIN Service S ON S.id_service=TS.id_service 
                    WHERE
                    id_technical=@id_technical AND 
                    entryDate between '${start} 00:00:00' AND '${end} 23:59:59'
                    order by entryDate desc
                `
            );
        return recordset;
    }

    const { recordset }: IResult<respGetServiceFiltered> = await pool1.request()
        .query(
            `
                SELECT S.id_service,folio,entryDate,exitDate,accountMW,isActive,digital,nameAccount,B.technicals FROM Service S
                LEFT JOIN Binnacle B ON B.id_service=S.id_service 
                WHERE 
                entryDate BETWEEN '${start} 00:00:00' AND '${end} 23:59:59'
                ${account ? `AND accountMW = '${account}'` : ''}
                order by entryDate desc
            `
        );

    return recordset;
}

export const GetService = async ({ id_service }: { id_service: string }) => {
    try {

        const { recordset: binnacle }: IResult<Binnacle> = await pool1.request()
            .input('id_service', TYPES.VarChar(40), id_service)
            .query(`SELECT * FROM Binnacle WHERE id_service = @id_service`);

        const { recordset: comments }: IResult<Comment> = await pool1.request()
            .input('id_service', TYPES.VarChar(40), id_service)
            .query(`SELECT * FROM Comment WHERE id_service= @id_service`);

        return { binnacle, comments }
    } catch (error) {
        return ` ${error}`;
    }
}
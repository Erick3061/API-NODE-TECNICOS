import { Request } from 'express-validator/src/base';
import { pool1 } from '../db/connection';
import { GetPersonGeneral, GetTypes, ExistTechnicalInService, GetRoles, UserAccess } from '../querys/querysTecnicos';
import { BAPEnterprice, ExistPerson, optionsUpdateEnterprice, optionsUpdatePerson } from '../rules/interfaces';
import moment from 'moment';
interface PropsRole { id: number, name: string, user?: string };

export const existEnterprice = async ({ id, shortName }: BAPEnterprice) => {
    if (!id) throw new Error("El campo id del objeto enterprice es obligatorio");
    if (!shortName) throw new Error("El campo shortName del objeto enterprice es obligatorio");
    try {
        const { rowsAffected } = await pool1.request().query(`select * from Enterprice where shortName = '${shortName}' and id_enterprice=${id}`);
        if (rowsAffected[0] === 0) throw new Error(`La empresa: ${shortName} con id: ${id} no existe`);
    } catch (error) {
        throw new Error(`${error}`);
    }
}

export const validEnterprice = async ({ shortName, name }: { shortName: string, name: string }) => {
    if (!name) throw new Error("El campo id del objeto enterprice es obligatorio");
    if (!shortName) throw new Error("El campo shortName del objeto enterprice es obligatorio");
    try {
        const { rowsAffected } = await pool1.request().query(`select * from Enterprice where shortName = '${shortName}' or name = '${name}'`);
        if (rowsAffected[0] !== 0) throw new Error(`La empresa ya existe`);
    } catch (error) {
        throw new Error(`${error}`);
    }
}
export const validateOptionUpdateEnterprice = (option: optionsUpdateEnterprice) => {
    const entries = Object.entries(option);
    if (entries.length > 1) throw new Error("Solo se debe mandar una opción");
    const actionValues = ['deleteEnterprice', 'updateData'];
    const [action, obj] = entries[0];
    const value = actionValues.find(a => a === action);
    if (value) {
        switch (value) {
            case 'deleteEnterprice':
                if (typeof obj === 'boolean') return true;
                throw new Error("Valores del objeto invalidos");

            case 'updateData':
                if (typeof obj === 'object') {
                    const params: Array<string> = ['name'];
                    const keys = Object.keys(obj);
                    const props = params.filter(m => keys.find(f => f === m) === undefined);
                    if (props.length > 0) throw new Error("Faltan propiedades");
                    return true;
                }
                throw new Error("Valores del objeto invalidos");
            default: throw new Error("Nimgún caso contemplado");
        }
    } else throw new Error("Nimgún caso contemplado");
}

export const validateOptionUpdatePerson = (option: optionsUpdatePerson) => {
    const entries = Object.entries(option);
    if (entries.length > 1) throw new Error("Solo se debe mandar una opción");
    const actionValues = ['resetPassword', 'deletePerson', 'updateStatus', 'updateData'];
    const [action, obj] = entries[0];
    const value = actionValues.find(a => a === action);
    if (value) {
        switch (value) {
            case 'resetPassword':
                if (typeof obj === 'boolean') return true;
                throw new Error("Valores del objeto invalidos");

            case 'deletePerson':
                if (typeof obj === 'boolean') return true;
                throw new Error("Valores del objeto invalidos");

            case 'updateStatus':
                if (typeof obj === 'string') {
                    if (obj === 'ACTIVO' || obj === 'INACTIVO') return true;
                }
                throw new Error("Valores del objeto invalidos");

            case 'updateData':
                if (typeof obj === 'object') {
                    const params: Array<string> = ['name', 'lastname', 'email', 'password', 'phoneNumber', 'employeeNumber', 'enterprice', 'role'];
                    const keys = Object.keys(obj);
                    const props = params.filter(m => keys.find(f => f === m) === undefined);
                    if (props.length > 0) {
                        if (props.length === 1 && props[0] === 'password') return true;
                        throw new Error("Faltan propiedades");
                    }
                    return true;
                }
                throw new Error("Valores del objeto invalidos");
            default: throw new Error("Nimgún caso contemplado");
        }
    } else throw new Error("Nimgún caso contemplado");
}

export const existRole = async ({ id, name, user }: PropsRole, req: Request) => {
    const body = req.body;
    if (!id) throw new Error("El campo id del objeto Role es obligatorio");
    if (!name) throw new Error("El campo id del objeto Role es obligatorio");
    if (user === '') {
        if (id === 2) throw new Error("Debe asignar un usuario si se trata de un monitorista");
        else if (body.email === '') throw new Error("Debe de asignar un nombre de usuario si la persona no cuenta con correo de la empresa");
    } else {
        const exist = await UserAccess({ id_user: null, exist: { nameUser: user!, id_role: id } });
        if (exist?.error) throw new Error(`${exist.error.msg}`);
    }
    try {
        const { rowsAffected } = await pool1.request().query(`select * from Role where id_role=${id} and name='${name}'`);
        if (rowsAffected[0] === 0) throw new Error(`El rol: ${name} con id: ${id} no existe`);
    } catch (error) {
        throw new Error(`${error}`);
    }
}

export const existEmail = async (email: string) => {
    try {
        const { rowsAffected } = await pool1.request().query(`select * from Person where email='${email}'`);
        if (rowsAffected[0] !== 0) throw new Error(`El correo: ${email} ya existe`);
    } catch (error) { throw new Error(`${error}`); }
}

export const existTypeService = async (id_type: number) => {
    const type = await GetTypes({ id_type });
    if (typeof (type) === 'string') throw new Error(`${type}`);
    if (type.length === 0) throw new Error(`id: ${id_type} No existe`);
    return true;
}

export const ExistPersonInDB = async ({ id, role }: ExistPerson) => {
    const person = await GetPersonGeneral({ id, role });
    if (typeof (person) === 'string') throw new Error(`${person}`);
    if (person === undefined) {
        const person = await GetPersonGeneral({ id, role, inactive: 'INACTIVO' });
        if (typeof (person) === 'string') throw new Error(`${person}`);
        if (person === undefined) throw new Error(`id: ${id} No existe`);
    }
    return true;
}

export const existTechnicals = async (technicals: Array<string>, query: Record<string, any> | undefined) => {
    if (technicals.length === 0) throw new Error(`Debes asignar al menos un tecnico a este servicio`);
    if (query!.del !== undefined || query!.sf !== undefined) {
        return true;
    } else {
        for (const iterator of technicals) {
            const exist = await GetPersonGeneral({ id: iterator, role: 1 });
            if (typeof (exist) === 'string') throw new Error(`${exist}`);
            if (exist === undefined) throw new Error(`Tecnico con id: ${iterator} no existe`);
            const inService = await ExistTechnicalInService(exist.id_person);
            if (typeof (inService) === 'string') throw new Error(`${inService}`);
            if (inService !== undefined) throw new Error(`Tecnico: ${inService.personName} ${inService.lastname} esta asignado a otro servicio activo`);
        }
        return true;
    }
}

export const existRoleinDB = async (id_role: string) => {
    const id = parseInt(id_role);
    if (id === 850827) return true;
    const exist = await GetRoles({ id_role: id });
    if (typeof (exist) === 'string') throw new Error(`${exist}`);
    if (exist.length === 0) throw new Error(`El rol: ${id_role} No existe`);
    return true;
}

export const isDate = (date: string): boolean => {
    if (moment(date, "YYYY-MM-DD", true).isValid()) return true;
    else throw new Error("Formato de fecha invalido");
}
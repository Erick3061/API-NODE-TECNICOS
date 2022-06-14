import { Request, Response } from "express";
import { pool1 } from '../db/connection';
import { actionEnterpriceProps, actionPersonProps, BAPEnterprice, bodyPerson } from '../rules/interfaces';
import { addPersonBD, GetEnterprices, GetPersonGeneral, GetRoles, GetTechnicalsInServiceActive, GetTypes, UpdatePerson, ExistEployeeNumber, UserAccess } from '../querys/querysTecnicos';
import { rError } from './errorController';
import { TYPES } from 'mssql';
import { existDirectory, deleteDirectory } from '../helpers/files';
import path from 'path';

/** @module ADMIN_CONTROLLER */

/**
 * @name actionsEnterprice
 * @description Actuaiza y Elimina la información de la empresa seleccionada o enviada solo se ejecuta una opción a la vez
 * @path {POST} /api/admin/enterpriceActions
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {Object<{id:Number, shortName:String}>} Datos de la empresa a modificar
 * @body {Object<{updateData:{shortName:String, name:String}}>} Datos que se actualizarán en la empresa seleccionada
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const actionsEnterprice = async (req: Request, resp: Response) => {
    const { enterprice, option }: actionEnterpriceProps = req.body;
    if (option.deleteEnterprice) {

    }

    if (option.updateData) {
        const { rowsAffected: isExist } = await pool1.request()
            .input('id_enterprice', TYPES.Numeric, enterprice.id)
            .input('shortName', TYPES.VarChar(50), option.updateData.shortName)
            .input('name', TYPES.VarChar(150), option.updateData.name)
            .query(`Select * from enterprice where shortName = @shortName and name = @name and id_enterprice != @id_enterprice`);
        if (isExist[0] !== 0) return rError({ status: 400, msg: `Los datos de la emmpresa ya existem`, resp });
        return await pool1.request()
            .input('id_enterprice', TYPES.Numeric, enterprice.id)
            .input('shortName', TYPES.VarChar(50), option.updateData.shortName)
            .input('name', TYPES.VarChar(150), option.updateData.name)
            .query(`Update Enterprice set shortName = @shortName, name = @name where id_enterprice = @id_enterprice`)
            .then(() =>
                resp.status(200).json({
                    status: true,
                    data: {
                        isUpdated: true
                    }
                })
            )
            .catch(err => rError({ status: 500, msg: `${err}`, resp }));
    }

    const Enterprice = await GetEnterprices({ enterprice: { id_enterprice: enterprice.id, shortName: enterprice.shortName } });
    if (typeof Enterprice === 'string') return rError({ status: 500, msg: Enterprice, resp });
    return resp.status(200).json({
        status: true,
        data: {
            enterprice: Enterprice[0]
        }
    });
}

/**
 * @name actionsPerson
 * @description Realiza acciones en las personas registradas en la base de datos
 * @path {POST} /api/admin/personActions
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {Ocject<{id:String, role:Number}>} person Datos de la persona a la que se la apicarán los cambios u acciones
 * @body {Object<{resetPassword:Boolean, deletePerson:Boolean, updateStatus:'ACTIVO', 'INACTIVO',  updateData:{ name: String, lastname: String, email: String, password: String, phoneNumber: String, employeeNumber: String, enterprice: Number, role: Number } }>} optios acciones
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const actionsPerson = async (req: Request, resp: Response) => {
    const { person, option }: actionPersonProps = req.body;

    if (option.resetPassword) {
        const Person = await GetPersonGeneral({ id: person.id });
        if (typeof Person === 'string') return rError({ status: 500, msg: Person, resp });
        if (Person === undefined) return rError({ status: 400, msg: `Persona inactiva, Activela para restaurar su contraseña`, resp });

        const passwordWasReset = await UpdatePerson({ id_person: Person.id_person, prop: `password = '${Person.employeeNumber}'` });
        if (typeof passwordWasReset === 'string') return rError({ status: 500, msg: passwordWasReset, resp });
        return resp.status(200).json({
            status: true,
            data: { passwordWasReset, Person }
        });
    }

    if (option.deletePerson) {
        const Person = await GetPersonGeneral({ id: person.id, inactive: 'INACTIVO' });
        if (typeof (Person) === 'object') {
            if (Person.id_role === 1) {
                const Technicals = await GetTechnicalsInServiceActive();
                if (typeof (Technicals) === 'string') return rError({ status: 500, msg: Technicals, resp, location: 'GetTechnicalsInServiceActive' });
                if (Technicals.find(f => f.id_person === Person.id_person)) return rError({ status: 400, msg: `Técnico: ${Person.personName} ${Person.lastname} esta en servicio`, resp, location: 'deletePerson' });
            }
            return await pool1.request().query(`delete Person where id_person = '${Person.id_person}'`).then(async () => {
                const isExistDirectory = await existDirectory(path.join(__dirname, '../../uploads/Person', Person.id_person));
                if (isExistDirectory) {
                    const isDeleted = await deleteDirectory(path.join(__dirname, '../../uploads/Person', Person.id_person));
                    console.log(isDeleted);
                }
                return resp.status(200).json({ status: true, data: { isDeleted: true } });
            }).catch(err => rError({ status: 500, msg: `${err}`, resp, location: 'deletePerson' }));
        } else {
            return rError({ status: 400, msg: `Primero debe Desactivar la persona seleccionada`, resp, location: 'deletePerson' });
        }
    }

    if (option.updateStatus) {
        if (person.role === 1 && option.updateStatus === 'INACTIVO') {
            const Technicals = await GetTechnicalsInServiceActive();
            if (typeof (Technicals) === 'string') return rError({ status: 500, msg: Technicals, resp, location: 'GetTechnicalsInServiceActive' });
            if (Technicals.find(f => f.id_person === person.id)) return rError({ status: 400, msg: `No se puede desactivar un técnico esta en servicio`, resp, location: 'updateStatusPerson' });
        }
        const isUpdated = await UpdatePerson({ id_person: person.id, prop: `status = '${option.updateStatus}'` });
        return (typeof isUpdated === 'string')
            ? rError({ status: 500, msg: `${isUpdated}`, resp, location: 'updateStatusPerson' })
            : resp.status(200).json({ status: true, data: { isUpdated } });
    }

    if (option.updateData) {
        let data: bodyPerson = option.updateData;

        const Person = await GetPersonGeneral({ id: person.id });

        if (typeof (Person) === 'string') throw (Person);

        if (Person === undefined) throw ("No existe la persona");

        const { role, enterprice, email, employeeNumber, lastname, name, password, phoneNumber } = option.updateData;

        const Enterprices = await GetEnterprices({ shortName: enterprice.shortName });

        if (typeof Enterprices === 'string') return rError({ status: 500, msg: Enterprices, resp });

        if (Enterprices.length === 0) return rError({ status: 400, msg: 'No esiste la empresa', resp });

        const Roles = await GetRoles({ role: { id_role: role.id, name: role.name } });

        if (typeof Roles === 'string') return rError({ status: 500, msg: Roles, resp });

        if (Roles.length === 0) return rError({ status: 400, msg: 'No existe el Rol', resp });

        if (employeeNumber === '') return rError({ status: 400, msg: `La persona no se puede quedar sin numero de empleado`, resp });

        if (email !== '') {
            const { recordset: existEmail } = await pool1.request()
                .input('id_person', TYPES.VarChar(40), person.id)
                .input('email', TYPES.VarChar, email)
                .query(`select email from Person where email = @email and id_person != @id_person`);
            if (existEmail.length > 0) return rError({ status: 400, msg: `El correo ${email} ya existe`, resp });
        }

        if (Person.employeeNumber !== employeeNumber) {
            const isExistEmployeNumber = await ExistEployeeNumber({ employeeNumber: employeeNumber, id_enterprice: enterprice.id, personExclude: person.id });
            if (typeof (isExistEmployeNumber) === 'string') return rError({ status: 500, msg: isExistEmployeNumber, resp });
            if (isExistEmployeNumber) return rError({ status: 400, msg: `Número de empleado ya esta asignado a otra persona`, resp });
            data = (Person.id_role !== 2) ? { ...data, password: data.employeeNumber } : data;
        }

        if (Person.nameUser !== role.user && data.role.id !== 2) {
            try {
                //verificar si la persona tiene un usuario registrado...
                const isPersonHaveUser = await UserAccess({ id_user: person.id, personHaveUser: { nameUser: role.user } });
                if (isPersonHaveUser && !isPersonHaveUser.isPersonHaveUser) {//No tiene usuario enUsers
                    if (role.user !== '') {//insertar
                        const existWithoutThisPerson = await UserAccess({ id_user: person.id, existWithoutThisPerson: { nameUser: role.user } });
                        if (existWithoutThisPerson?.error) return rError({ status: existWithoutThisPerson.error.status, msg: existWithoutThisPerson.error.msg, resp });
                        const isInserted = await UserAccess({ id_user: person.id, insert: { nameUser: role.user } });
                        if (isInserted?.error) return rError({ status: isInserted.error.status, msg: isInserted.error.msg, resp });
                    }
                } else {//Tiene usuario en users
                    if (role.user === '') {//delete
                        const isDeleted = await UserAccess({ id_user: person.id, deleteUser: true });
                        if (typeof (isDeleted) === 'string') return rError({ status: 500, msg: isDeleted, resp });
                    } else {//update
                        const existWithoutThisPerson = await UserAccess({ id_user: person.id, existWithoutThisPerson: { nameUser: role.user } });
                        if (existWithoutThisPerson?.error) return rError({ status: existWithoutThisPerson.error.status, msg: existWithoutThisPerson.error.msg, resp });
                        const isUpdated = await UserAccess({ id_user: person.id, update: { nameUser: role.user } });
                        if (isUpdated?.error) return rError({ status: isUpdated.error.status, msg: isUpdated.error.msg, resp });
                    }
                }
            } catch (error) {
                return rError({ status: 500, msg: `${error}`, resp });
            }
        }

        const updated = await UpdatePerson({ id_person: person.id, data: { email, employeeNumber, lastname, password: password === undefined ? Person.password : password, personName: name, phoneNumber } });
        if (typeof (updated) === 'string') return rError({ status: 500, msg: updated, resp });
        return resp.status(200).json({
            status: true,
            data: {
                isUpdated: true
            }
        });

    }
}

/**
 * @name addEnterprice
 * @description Agrega una empresa
 * @path {POST} /api/admin/addEnterprice
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {Object<{shorName:String, name:String}>} enterprice Datos de la empresa a agregar
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const addEnterprice = async (req: Request, resp: Response) => {
    const { enterprice }: { enterprice: { shortName: string, name: string } } = req.body;
    return await pool1.request()
        .input('shortName', TYPES.VarChar(50), enterprice.shortName)
        .input('name', TYPES.VarChar(150), enterprice.name)
        .query(`Insert into Enterprice( shortName, name ) values ( @shortName, @name )`)
        .then(() => {
            return resp.json({
                status: true,
                data: {
                    isInserted: true
                }
            });
        })
        .catch(err => rError({ status: 500, msg: `${err}`, resp }));
}

/**
 * @name addPerson
 * @description Agrega una persona nueva
 * @path {POST} /api/admin/addPerson
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {String} name Nombre de la persona
 * @body {String} lastname Apellidos de la persona
 * @body {String} [email] Correo electronico de la persona
 * @body {String} passsword Contraseña de la persona
 * @body {String} phoneNumber Teléfono de contacto de la persona
 * @body {String} employeeNumber Número de empleado de la persona
 * @body {Object<{ id:Number, shorName:String }>} enterprice Datos de la empresa registrada a la que la persona pertenece
 * @body {Object<{ id:Number, name:String, user:String, '' }>} role Rol que desempeña la persona al igual si no tiene un correo se le asigna un usuario para su acceso a las diferentes aplicaciones por rol
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
  */
export const addPerson = async (req: Request, resp: Response) => {
    let body: bodyPerson = req.body;
    const { error, isInserted } = await addPersonBD(body);
    return (isInserted)
        ? resp.status(isInserted.status).json({ status: true, data: { isInserted: true } })
        : (error) ? rError({ status: error.status, msg: error.msg, resp, location: 'addPersonBD' }) : rError({ status: 500, msg: 'desconocido', resp });
}

export const Enterprice = async (req: Request, resp: Response) => { }

/**
 * @name getGeneral
 * @description Obtiene los parámetros generales de empresas, roles, y tipo de servicio
 * @path {GET} /api/sys/getGeneral
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const getGeneral = async (req: Request, resp: Response) => {
    try {
        const Enterprices = await GetEnterprices({});
        const Roles = await GetRoles({});
        const ServicesTypes = await GetTypes({});
        if (typeof (Enterprices) !== 'string' && typeof (Roles) !== 'string' && typeof (ServicesTypes) !== 'string') {
            return resp.status(200).json({
                status: true,
                data: {
                    Enterprices,
                    Roles,
                    ServicesTypes
                }
            });
        } else {
            let error: string = (typeof (Enterprices) === 'string' && typeof (Roles) === 'string') ? `No hay Empresas y Roles de persona registrados `
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
    } catch (error) {
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


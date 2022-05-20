import { Request, Response } from "express";
import { administrator, Person } from '../rules/interfaces';
import { GetPersonGeneral, GetTechnicalInService, UpdatePerson } from '../querys/querysTecnicos';
import { generarJWT, SECRETORPPRIVATEKEY } from '../helpers/generar-jwt';
import { rError } from './errorController';
import jwt from 'jsonwebtoken';
import { Service } from '../rules/response';
import { getDate } from '../functions/functions';

export const LogIn = async (req: Request, resp: Response) => {
    let Service: Service | undefined = undefined;
    const { acceso, password }: { acceso: string, password: string } = req.body;
    try {
        const date = getDate();
        const Person: Person | string = (acceso.toLowerCase() === 'admin') ? administrator : await GetPersonGeneral((acceso.includes('@')) ? { email: acceso } : { user: acceso });
        if (typeof (Person) === 'string') return rError({ status: 500, msg: Person, location: 'LogIn', resp });
        if (Person === undefined) return rError({ status: 400, msg: `${(acceso.includes('@')) ? `correo` : `usuario`} ${acceso} no registrado`, location: 'LogIn', resp });
        if (Person.personName !== 'Administrator') {
            if (password !== Person.password) return rError({ status: 400, msg: `Contraseña incorrecta`, location: 'LogIn', resp });
        }
        else {
            if (password !== `pem${date.date.month}${date.date.day}${date.time.hour + 85}${date.weekday}`) return rError({ status: 400, msg: `Contraseña incorrecta`, location: 'LogIn', resp });
        }
        const { error, token }: { token?: string, error?: string } = await generarJWT(Person.id_person, Person.id_role);
        if (error) return rError({ status: 400, msg: `Error al generar el token`, location: 'LogIn', resp });
        if (Person.id_role === 1) {
            const resp = await GetTechnicalInService(Person.id_person);
            if (typeof (resp) !== 'string') { Service = resp; };
        }
        const { password: p, ...rest } = Person;
        return resp.status(200).json({
            status: true,
            data: { Person: rest, Service, token }
        });
    } catch (error) {
        return rError({ status: 500, msg: `Error en el servidor Error: ${error}`, location: 'LogIn', resp });
    }
}

export const tokenValido = async (req: Request, resp: Response) => {
    let Service: Service | undefined = undefined;
    const token: string | undefined = req.header('x-token') || '';
    const clave = SECRETORPPRIVATEKEY;
    const decode = jwt.verify(token, clave);
    const id_person: string = (decode as jwt.JwtPayload).uid;
    const Person: Person | string = (id_person === 'admin') ? administrator : await GetPersonGeneral({ id: id_person });
    if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, location: 'validarJWT', resp });
    if (Person === undefined) return rError({ status: 400, msg: 'error persona no existe', location: 'validarJWT', param: id_person, resp });
    if (Person.id_role === 1) {
        const resp = await GetTechnicalInService(Person.id_person);
        if (typeof (resp) !== 'string') { Service = resp; }
    }
    const { password: p, ...rest } = Person;
    return resp.status(200).json({
        status: true,
        data: { Person: rest, Service, token }
    });
}

export const ChangePassword = async (req: Request, resp: Response) => {
    try {
        const { password }: { password: string } = req.body;
        const token: string | undefined = req.header('x-token') || '';
        const clave = SECRETORPPRIVATEKEY;
        const decode = jwt.verify(token, clave);
        const id_person: string = (decode as jwt.JwtPayload).uid;
        if (id_person === 'admin') rError({ status: 400, msg: 'Administrador no puede cambiar la contraseña', resp });
        const Person: Person | string = await GetPersonGeneral({ id: id_person });
        if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, location: 'ChangePassword', resp });
        if (Person === undefined) return rError({ status: 400, msg: 'error persona no existe', location: 'ChangePassword', param: id_person, resp });
        const updated = await UpdatePerson({ id_person: Person.id_person, prop: `password='${password}'` });
        if (typeof (updated) === 'string') return rError({ status: 400, msg: updated, location: 'ChangePassword', resp });
        return resp.status(200).json({
            status: true,
            data: { changed: true }
        });
    } catch (error) {
        return rError({ status: 500, msg: `${error}`, location: 'ChangePassword', resp });
    }
}

export const ForgetPassword = async (req: Request, Resp: Response) => {
    try {

    } catch (error) {

    }
}
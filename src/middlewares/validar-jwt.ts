import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { rError } from '../controller/errorController';
import { SECRETORPPRIVATEKEY } from '../helpers/generar-jwt';
import { GetPersonGeneral } from '../querys/querysTecnicos';

/**
 * Hace la validacón del JWT 
 * @param {Request} req 
 * @param {Response} resp 
 * @param {NextFunction} next 
 * @returns {Promise<Response<any, Record<string, any>> | undefined>}
 */
export const validarJWT = async (req: Request, resp: Response, next: NextFunction) => {
    const token = req.header('x-token');
    if (!token)
        return rError({ status: 401, msg: `No hay token en la petición`, location: 'validarJWT', resp });
    try {
        const clave = SECRETORPPRIVATEKEY;
        const decode = jwt.verify(token, clave);
        if (typeof (decode) === 'string')
            return rError({ status: 400, msg: decode, location: 'validarJWT', resp });
        const person = await GetPersonGeneral({ id: decode.uid });
        if (typeof (person) === 'string')
            return rError({ status: 400, msg: person, location: 'validarJWT', resp });
        if (person === undefined) {
            if (decode.uid !== 'admin')
                return rError({ status: 400, msg: 'error persona no existe', location: 'validarJWT', param: decode.uid, resp });
        }
        next();
    } catch (error) {
        rError({ status: 400, msg: `${error}`, location: 'validarJWT', param: token, resp });
    }
}
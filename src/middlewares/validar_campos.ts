import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Hace la validación de los campos enviados en express
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * @returns {Response<any, Record<string, any>> | undefined}
 */
export const validarCampos = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({
            status: false,
            ...errors,
        });
    }
    next();
}

import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

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

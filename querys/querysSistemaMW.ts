import { Request, Response } from "express";
import { IResult } from "mssql";
import { pool2 } from '../db/connection';
import { DecriptRot39 } from "../functions/functions";

export const getUsersMon = async (req: Request, resp: Response) => {
    interface resp { CodigoUsuario: string; password: string; Nombre: string; }
    try {
        const { rowsAffected, recordset }: IResult<resp> = await pool2.request().query(`select CodigoUsuario, Contraseña as password, Nombre from Usuario where Inactivo='false'`);
        if (rowsAffected[0] !== 0) {
            return resp.json({
                status: true,
                data: {
                    users: recordset.map(el => { return { user: el.CodigoUsuario.trim(), password: DecriptRot39(el.password.trim()), name: el.Nombre.trim() } })
                }
            });
        } else {
            return resp.status(200).json({
                status: false,
                errors: [
                    {
                        value: '',
                        msg: 'Error al obtener Usuarios MW',
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
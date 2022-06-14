import { Request, Response } from "express";
import { IResult } from "mssql";
import apiMW from "../api/apiMW";
import { DecriptRot39 } from "../functions/functions";
import { ResponseApi } from "../rules/interfaces";
/**@module CONSULTAS_SISTEMA_MONITORING-WORKS */

/**
 * @name getUsersMon
 * @description Obtiene todos los usuarios y contraseñas de los monitoristas de Mw
 * @path {GET} /api/sys/getUsersMon
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const getUsersMon = async (req: Request, resp: Response) => {
    interface resp { CodigoUsuario: string; password: string; Nombre: string; }
    try {
        const response = await apiMW(`system-users`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{usuarios:Array<resp>}> = response.data;
        // const { rowsAffected, recordset }: IResult<resp> = await pool2.request().query(`select CodigoUsuario, Contraseña as password, Nombre from Usuario where Inactivo='false'`);
        if (status && data) {
            return resp.status(200).json({
                status: true,
                data: {
                    users: data.usuarios.map(el => { return { user: el.CodigoUsuario.trim(), password: DecriptRot39(el.password.trim()), name: el.Nombre.trim() } })
                }
            });
        } else {
            return resp.status(400).json({
                status: false,
                errors
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
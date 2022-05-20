import { Request, Response } from "express";
import { upLoadFile } from "../helpers/files";
import { GetActiveServices } from "../querys/querysTecnicos";
import { rError } from './errorController';


export const loadFile = async (req: Request, resp: Response) => {
    const { id_service } = req.body;

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) return rError({ status: 400, msg: 'No hay archivos que subir', resp });
    const service = await GetActiveServices({ service: id_service });
    if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
    if (service === undefined) return rError({ status: 500, msg: 'Servicio no existe', resp });

    return await upLoadFile({ files: req.files, carpeta: 'andrade' }).then(response => {
        return resp.status(200).json({
            status: true,
            data: {
                isInserted: true,
                name: response
            }
        });
    }).catch(err => {
        rError({ status: 500, msg: `${err}`, resp });
    });
}
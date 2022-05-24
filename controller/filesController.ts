import { Request, Response, json } from 'express';
import { rError } from './errorController';
import { GetActiveServices, UpdateService } from '../querys/querysTecnicos';
import { deleteDirectory, deleteFile, existDirectory, getFiles, upLoadFile } from '../helpers/files';
import path from 'path';

export const sendFile = async (req: Request, resp: Response) => {
    const { service: id_service, img } = req.query;
    if (id_service === undefined || img === undefined) return rError({ status: 404, msg: 'Error', resp });
    const service = await GetActiveServices({ service: { id_service: `${id_service}` } });
    if (typeof (service) === 'string') return rError({ status: 404, msg: 'Error', resp });
    if (service.length === 0) return rError({ status: 404, msg: 'Error', resp });
    const directory: string = path.join(__dirname, '../uploads', service[0].id_service);
    const isExist = await existDirectory(directory);
    if (isExist) {
        const files = await getFiles(directory);
        console.log(files);
        if (files.includes(`${img}`)) {
            resp.sendFile(path.join(directory, `${img}`));
        } else {
            return rError({ status: 404, msg: 'Error', resp });
        }
    } else {
        return rError({ status: 404, msg: 'Error', resp });
    }
}

export const deleteFileToService = async (req: Request, resp: Response) => {
    const { id_service, file } = req.body;
    const service = await GetActiveServices({ service: { id_service } });
    if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
    if (service.length === 0) return rError({ status: 500, msg: 'Servicio no existe', resp });
    const directory: string = path.join(__dirname, '../uploads', service[0].id_service);
    const isExist = await existDirectory(directory);

    if (isExist) {
        const files = await getFiles(directory);
        if (files.length === 0) {
            const isDeleted = await deleteDirectory(directory)
            if (typeof (isDeleted) === 'string') return rError({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
            return resp.status(200).json({
                status: true,
                data: {
                    isDeleted: true,
                }
            })
        }
        if (files.includes(file)) {
            const isDeleted = await deleteFile(path.join(directory, file));
            if (typeof (isDeleted) === 'string') return rError({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
            const files = await getFiles(directory);
            if (files.length === 0) {
                const isDeleted = await deleteDirectory(directory)
                if (typeof (isDeleted) === 'string') return rError({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
                const updated = await UpdateService({ id_service, interno: true, prop: `filesCron = 'standby'` });
                if (typeof (updated) === 'string') return rError({ status: 400, msg: 'Error al cambiar el estado de los archivos del servicio a standby', resp });
                if (typeof (updated) === 'object') return rError({ status: 500, msg: 'respuesta invalida loadFile debe ser un proceso interno', resp });

                return resp.status(200).json({
                    status: true,
                    data: {
                        isDeleted: true,
                    }
                })
            }
            return resp.status(200).json({
                status: true,
                data: {
                    isDeleted: true,
                }
            })
        } else {
            return rError({ status: 500, msg: 'No existe el archivo', resp });
        }
    } else {
        return rError({ status: 500, msg: 'Directorio inexistente', resp });
    }
}

export const loadFile = async (req: Request, resp: Response) => {
    const { id_service } = req.body;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) return rError({ status: 400, msg: 'No hay archivos que subir', resp });
    const service = await GetActiveServices({ service: { id_service } });
    if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
    if (service.length === 0) return rError({ status: 500, msg: 'Servicio no existe', resp });
    console.log(req.files);

    return await upLoadFile({ files: req.files, carpeta: service[0].id_service }).then(async response => {
        const data: { nameFile: string, directoryFile: string, fullDirectory: string } = JSON.parse(`${response}`);
        if (service[0].filesCron === 'standby') {
            const updated = await UpdateService({ id_service, interno: true, prop: `filesCron = 'going up'` });
            if (typeof (updated) === 'string') {
                const deleted = await deleteFile(data.fullDirectory);
                if (typeof (deleted) === 'string') return rError({ status: 500, msg: `Error: ${deleted}`, resp });
                return rError({ status: 400, msg: `Error al actualizar fileCron del servicio ${service[0].id_service} ${updated}`, resp })
            };
            if (typeof (updated) === 'object') return rError({ status: 500, msg: 'respuesta invalida loadFile debe ser un proceso interno', resp });
        }
        return resp.status(200).json({
            status: true,
            data: {
                isInserted: true,
                ...data,
            }
        });
    }).catch(err => {
        rError({ status: 500, msg: `${err}`, resp });
    });
}
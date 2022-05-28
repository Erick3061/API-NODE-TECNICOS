import { Request, Response, json } from 'express';
import { rError } from './errorController';
import { GetActiveServices, GetEnterprices, GetPersonGeneral, UpdateService } from '../querys/querysTecnicos';
import { deleteDirectory, deleteFile, existDirectory, getFiles, upLoadFile } from '../helpers/files';
import path from 'path';
import { Service } from '../rules/response';
import { IRecordSet } from 'mssql';
import { Person } from '../rules/interfaces';

export const sendFile = async (req: Request, resp: Response) => {
    const { id, img, type } = req.query;
    if (id === undefined || img === undefined || type === undefined) return rError({ status: 404, msg: 'Error faltan parametros', resp });
    if (type !== 'Service' && type !== 'Person' && type !== 'Enterprice') return rError({ status: 400, msg: 'No existe drectorio', resp });
    const directory: string = path.join(__dirname, '../../uploads', type, `${id}`, `${img}`);
    const isExist = await existDirectory(directory);
    if (isExist) {
        const files = await getFiles(directory);
        console.log(files);
        if (files.includes(`${img}`)) {
            resp.sendFile(directory);
        } else {
            return rError({ status: 404, msg: 'Error', resp });
        }
    } else {
        return rError({ status: 404, msg: 'Error', resp });
    }
}

export const getImgs = async (req: Request, resp: Response) => {
    const { id, type } = req.params;
    const completePath: string = `../../uploads/${type}`;
    const directory: string = path.join(__dirname, completePath, id);
    let service: string | IRecordSet<Service> | undefined = undefined;
    let Person: string | Person | undefined;

    if (type === 'Service') {
        service = await GetActiveServices({ service: { id_service: id, selected: true } });
        if (typeof (service) === 'string') return rError({ status: 404, msg: service, resp });
        if (service.length === 0) return rError({ status: 404, msg: `Servicio no existe`, resp });
        if (service[0].filesCron === 'deleted') return rError({ status: 400, msg: 'No existen Fotos ya han sido eliminadas de manera automatica', resp });
    }
    if (type === 'Person') {
        Person = await GetPersonGeneral({ id });
        if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, resp });
        if (Person === undefined) return rError({ status: 500, msg: 'Pesona no existe', resp });
    }
    if (type === 'Enterprice') {

    }

    const files = await getFiles(directory)
    if (typeof (files) === 'string') return rError({ status: 400, msg: (service && service[0].filesCron === 'standby') ? 'No se han subido fotos' : files, resp });
    return resp.status(200).json({
        status: true,
        data: { files }
    });
}

export const deleteFileToService = async (req: Request, resp: Response) => {
    const { id_service, file } = req.body;
    const service = await GetActiveServices({ service: { id_service } });
    if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
    if (service.length === 0) return rError({ status: 500, msg: 'Servicio no existe', resp });
    const directory: string = path.join(__dirname, '../../uploads/Service', service[0].id_service);
    const isExist = await existDirectory(directory);

    if (isExist) {

        const files = await getFiles(directory);
        if (files.length === 0) {
            const isDeleted = await deleteDirectory(directory)
            if (typeof (isDeleted) === 'string') return rError({ status: 400, msg: 'Error al eliminar el directorio del servicio', resp });
            return resp.status(200).json({
                status: true,
                data: { isDeleted: true }
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
    const { id, type } = req.params;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) return rError({ status: 400, msg: 'No hay archivos que subir', resp });
    switch (type) {
        case 'Service':
            const id_service: string = id;
            const service = await GetActiveServices({ service: { id_service } });
            if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
            if (service.length === 0) return rError({ status: 500, msg: 'Servicio no existe', resp });
            return await upLoadFile({ files: req.files, type, carpeta: service[0].id_service }).then(async response => {
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

        case 'Person':
            const id_person: string = id;
            const Person = await GetPersonGeneral({ id: id_person });
            if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, resp });
            if (Person === undefined) return rError({ status: 500, msg: 'Pesona no existe', resp });

            return await upLoadFile({ files: req.files, type, id: id_person }).then(async response => {
                const data: { nameFile: string, directoryFile: string, fullDirectory: string } = JSON.parse(`${response}`);
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

        case 'Enterprice':

            break;

        default: return rError({ status: 400, msg: 'parametro invalido', resp });
    }
}
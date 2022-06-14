import { Request, Response } from 'express';
import { rError } from './errorController';
import { GetActiveServices, GetPersonGeneral, UpdateService } from '../querys/querysTecnicos';
import { deleteDirectory, deleteFile, existDirectory, getFiles, upLoadFile } from '../helpers/files';
import path from 'path';
import { responseLoadedFile } from '../rules/interfaces';

/** @module FILES_CONTROLLER */

/**
 * @name sendFile
 * @description retorna el recurso consultado
 * @path {GET} /api/files/getImg
 * @response {Object} response
 * @response {File} files.ext Retorna un recurso como archivo
 * @response {Array} [response.errors] Errores en la petición
 */
export const sendFile = async (req: Request, resp: Response) => {
    const { id, img, type } = req.query;
    if (id === undefined || img === undefined || type === undefined) return rError({ status: 404, msg: 'Error faltan parametros', resp });
    if (type !== 'Service' && type !== 'Person' && type !== 'Enterprice') return rError({ status: 400, msg: 'No existe drectorio', resp });
    const directory: string = path.join(__dirname, '../../uploads', type, `${id}`, `${img}`);
    const isExist = await existDirectory(directory);
    return (isExist) ? resp.sendFile(directory) : rError({ status: 404, msg: 'Directorio inexistente', resp });
}

/**
 * @name getImgs
 * @description Retorna un Arreglo de los nombres de los archivos de un directorio ya sea un Servicio, Persona, Empresa
 * @path {GET} /api/files/getImgs/:id/:type
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @body {String} id id de la persona, servicio, empresa(en proxima actualización)
 * @body {String} type Tipo de carpeta {'Service' | 'Person' | 'Enterprice'}
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
export const getImgs = async (req: Request, resp: Response) => {
    const { id, type } = req.params;
    const directory: string = path.join(__dirname, `../../uploads/${type}`, id);
    if (!await existDirectory(directory)) return rError({ status: 401, msg: 'Directorio no existe', resp });

    if (type === 'Service') {
        const service = await GetActiveServices({ service: { id_service: id, selected: true } });
        if (typeof (service) === 'string') return rError({ status: 404, msg: service, resp });
        if (service.length === 0) return rError({ status: 404, msg: `Servicio no existe`, resp });
        if (service[0].filesCron === 'deleted') return resp.status(200).json({ status: true, data: { files: [] } });
    }

    if (type === 'Person') {
        const Person = await GetPersonGeneral({ id });
        if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, resp });
        if (Person === undefined) return rError({ status: 500, msg: 'Pesona no existe', resp });
    }

    if (type === 'Enterprice') {

    }
    const files = await getFiles(directory);
    return (Array.isArray(files)) ? resp.status(200).json({ status: true, data: { files } }) : rError({ status: 500, msg: 'Error en el servidor de archivos...', resp });
}

/**
 * @name deleteFileToService
 * @description elimina archivos de un servicio en especifico, si la carpeta se queda sin ningun archivo, la carpeta será elimnada
 * @path {POST} /api/files/deleteFileToService
 * @body {String} id_service id del servicio activo
 * @body {String} file Nombre del archivo con su extensión 
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
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

/**
 * @name loadFile 
 * @description Carga un archivo en un directorio dentro del servidor
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @path {PUT} /api/files/loadFile/:id/:type
 * @body {String} id id del servicio, persona o empresa
 * @body {String} type Tipo de carpeta a guardar 'Service', 'Person', 'Enterprice'
 * @body {FILE} file Archivo seleccionado con extensión: 'png', 'jpg', 'jpeg'
 */
export const loadFile = async (req: Request, resp: Response) => {
    const { id, type } = req.params;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) return rError({ status: 400, msg: 'No hay archivos que subir', resp });
    let response: string | responseLoadedFile;

    switch (type) {
        case 'Service':
            const service = await GetActiveServices({ service: { id_service: id } });
            if (typeof (service) === 'string') return rError({ status: 400, msg: service, resp });
            if (service.length === 0) return rError({ status: 500, msg: 'Servicio no existe', resp });
            response = await upLoadFile({ files: req.files, type, carpeta: service[0].id_service });
            if (typeof response === 'string') { return rError({ status: 400, msg: response, resp }); }

            if (service[0].filesCron === 'standby') {
                const updated = await UpdateService({ id_service: id, interno: true, prop: `filesCron = 'going up'` });
                if (typeof (updated) === 'string') {
                    const deleted = await deleteFile(response.fullDirectory);
                    if (typeof (deleted) === 'string') return rError({ status: 500, msg: `Error: ${deleted}`, resp });
                    return rError({ status: 400, msg: `Error al actualizar fileCron del servicio ${service[0].id_service} ${updated}`, resp })
                };
                if (typeof (updated) === 'object') return rError({ status: 500, msg: 'respuesta invalida loadFile debe ser un proceso interno', resp });
            }
            return resp.status(200).json({
                status: true,
                data: {
                    isInserted: true,
                    ...response,
                }
            });

        case 'Person':
            const id_person: string = id;
            const Person = await GetPersonGeneral({ id: id_person });
            if (typeof (Person) === 'string') return rError({ status: 400, msg: Person, resp });
            if (Person === undefined) return rError({ status: 500, msg: 'Pesona no existe', resp });
            response = await upLoadFile({ files: req.files, type, carpeta: id_person })
            if (typeof response === 'string') return rError({ status: 500, msg: response, resp });
            return resp.status(200).json({
                status: true,
                data: {
                    isInserted: true,
                    ...response,
                }
            });

        case 'Enterprice':

            break;

        default: return rError({ status: 400, msg: 'parametro invalido', resp });
    }
}
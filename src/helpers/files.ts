import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { access } from 'fs';
import { mkdir } from 'node:fs';
import { readdir, unlink, rmdir } from 'node:fs/promises';
import { propsUpLoadFile, responseLoadedFile } from '../rules/interfaces';

/**@module FILES */

/**
 * Verifica si existe un directorio dentro de la ruta mandada
 * @param {string} directory ruta a verificar 
 * @returns {Promise<boolean>}
 */
export const existDirectory = async (directory: string) => {
    return await new Promise((resolve: (value: boolean) => void, reject: (reason?: boolean) => void) => {
        access(directory, err => (err) ? reject(false) : resolve(true));
    }).then(resp => resp).catch(err => false);
}

/**
 * Crea un folder en el directorio mandado
 * @param {string} directory directorio mandada
 * @returns { Promise<boolean> }
 */
export const createFolder = async (directory: string) => {
    return await new Promise((resolve: (value: boolean) => void, reject: (reason?: string) => void) => {
        mkdir(directory, { recursive: true }, (err) => { (err) ? reject(`Directorio [ ${directory} ] no creado`) : resolve(true) });
    }).then(() => true).catch(err => { console.log(`--> createFolder`, err); return false });
}

/**
 * Obtiene los nombres y extensión de los archivos del directorio mandado
 * @param {string} directory directorio mandado
 * @returns {Promise<string | string[]>}
 */
export const getFiles = async (directory: string) => await readdir(directory).then(files => files).catch(err => { console.log(`-->getFiles`, err); return `${err}` });

/**
 * Elimina el archivo mandado con extensión
 * @param {string} directoryFile directorio mandado
 * @returns {Promise<string | boolean>}
 */
export const deleteFile = async (directoryFile: string) => await unlink(directoryFile).then(() => true).catch(err => `${err}`);

/**
 * Elimina el directorio mandado junto con los archivos y carpetas que se encuentran dentro de el 
 * @param {string} folder directrio dek filder mandado
 * @returns {Promise<string | boolean>}
 */
export const deleteDirectory = async (folder: string) => await rmdir(folder, { recursive: true }).then(() => true).catch(err => `${err}`);

/**
 * Sube un archivo con la sig extensón de archivos 'png', 'jpg', 'jpeg'
 * @param {Object<{ files: fileUpload.FileArray, validExtensions: string[], carpeta:string, type: "Service" | "Person" | "Enterprice"  }>} param0 
 * @returns { Promise<string | responseLoadedFile>}
 */
export const upLoadFile = async ({ files, validExtensions = ['png', 'jpg', 'jpeg'], carpeta = '', type }: propsUpLoadFile) => {

    return await new Promise(async (resolve: (value: responseLoadedFile) => void, reject: (reason?: string) => void) => {
        const numberFiles: number = 3;
        const { file } = files;
        if (Array.isArray(file)) return reject('Error de archivo...  revisar');
        const uploads: string = path.join(__dirname, `../../uploads`, type, carpeta);
        const cutName = file.name.split('.');
        const extension = cutName[cutName.length - 1];
        if (!validExtensions.includes(extension)) return reject(`La extensión ${extension} no es permitida - ${validExtensions}`);
        const idFile = `${uuidv4()}.${extension}`;

        if (!await existDirectory(uploads)) {
            if (await createFolder(uploads)) {
                return file.mv(path.join(uploads, idFile), (err) => {
                    if (err) return reject(`Error: ${err}`);
                    return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                });
            } else return reject(`Error al crear el directorio ${uploads}`)
        } else {
            if (type === 'Service') {
                const files = await getFiles(uploads);
                if (Array.isArray(files) && files.length < 3) {
                    return file.mv(path.join(uploads, idFile), (err) => {
                        if (err) return reject(`Error: ${err}`);
                        return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                    });
                }
                return reject(`No puedes subir mas imágenes, Solo se permiten ${numberFiles} archivos por servicio`);
            }

            if (type === 'Person' || type === 'Enterprice') {
                const files = await getFiles(uploads);
                if (Array.isArray(files)) for (const file of files) { await deleteFile(path.join(uploads, file)); };

                return file.mv(path.join(uploads, idFile), (err) => {
                    if (err) return reject(`Error: ${err}`);
                    return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                });
            }

            return reject(`Propiedad no contemplada`);
        }
    }).then(resp => resp).catch(err => `${err}`);
}
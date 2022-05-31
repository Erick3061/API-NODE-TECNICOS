import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import util from 'util';
import { mkdir, access } from 'fs';
import { readdir, unlink, rmdir } from 'node:fs/promises';

export const existDirectory = async (directory: string) => {
    return new Promise((resolve, reject) => {
        access(directory, err => (err) ? reject('Error') : resolve('Correct'));
    }).then(() => true).catch(() => false);
}

export const createFolder = async (directory: string) => {
    const makeDir = util.promisify(mkdir);
    return await makeDir(directory, { recursive: true }).then(() => true).catch(() => false);
}

export const getFiles = async (directory: string) => {
    try {
        const files = await readdir(directory);
        return files;
    } catch (err) {
        return `${err}`;
    }
}

export const deleteFile = async (directoryFile: string) => {
    try {
        await unlink(directoryFile);
        return true;
    } catch (error) {
        return `Error: ${error}`;
    }
}

export const deleteDirectory = async (folder: string) => {
    try {
        await rmdir(folder, { recursive: true });
        return true;
    } catch (error) {
        return `Error: ${error}`;
    }
}

export const upLoadFile = async ({ files, validExtensions = ['png', 'jpg', 'jpeg'], carpeta = '', id, type }: { files: fileUpload.FileArray, validExtensions?: Array<string>, type: 'Service' | 'Person' | 'Enterprice', id?: string, carpeta?: string }) => {

    return await new Promise(async (resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
        const numberFiles: number = 3;
        const { file } = files;
        if (Array.isArray(file)) return reject('Error de archivo...  revisar');
        if (carpeta !== '' && id) return reject('No se puden combinar carperta y id');
        if (id) carpeta = id;
        const uploads: string = path.join(__dirname, `../../uploads`, type, carpeta);
        const cutName = file.name.split('.');
        const extension = cutName[cutName.length - 1];
        if (!validExtensions.includes(extension)) return reject(`La extensión ${extension} no es permitida - ${validExtensions}`);
        const idFile = `${uuidv4()}.${extension}`;

        if (await existDirectory(uploads)) {
            if (type === 'Service') {
                const files = await getFiles(uploads);
                if (typeof (files) === 'string') reject(files);
                if (files.length < 3) {
                    return file.mv(path.join(uploads, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        return resolve(JSON.stringify({ nameFile: idFile, directoryFile: uploads, fullDirectory: path.join(uploads, idFile) }));
                    });
                } else {
                    return reject(`No puedes subir mas imágenes, Solo se permiten ${numberFiles} archivos por servicio`)
                }
            }
            if (type === 'Person' || type === 'Enterprice') {
                const files = await getFiles(uploads);
                if (Array.isArray(files)) {
                    for (const file of files) { await deleteFile(path.join(uploads, file)); }
                }
                return file.mv(path.join(uploads, idFile), (err) => {
                    if (err) reject(`Error: ${err}`);
                    return resolve(JSON.stringify({ nameFile: idFile, directoryFile: uploads, fullDirectory: path.join(uploads, idFile) }));
                });
            }
            return reject(`Propiedad no contemplada`);
        } else {
            if (await createFolder(uploads)) {
                file.mv(path.join(uploads, idFile), (err) => {
                    if (err) reject(`Error: ${err}`);
                    resolve(JSON.stringify({ nameFile: idFile, directoryFile: uploads, fullDirectory: path.join(uploads, idFile) }));
                });
            } else {
                reject(`Error al crear el directorio ${uploads}`);
            }
        }
    })
}
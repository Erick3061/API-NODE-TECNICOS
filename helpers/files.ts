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
        await rmdir(folder);
        return true;
    } catch (error) {
        return `Error: ${error}`;
    }
}

export const upLoadFile = async ({ files, validExtensions = ['png', 'jpg', 'jpeg', 'gif'], carpeta = '' }: { files: fileUpload.FileArray, validExtensions?: Array<string>, carpeta?: string }) => {

    return await new Promise(async (resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
        const numberFiles: number = 3;
        const uploads: string = path.join(__dirname, '../uploads/');
        const folderService: string = path.join(uploads, carpeta);
        const { file } = files;
        if (Array.isArray(file)) return reject('Error de archivo...  revisar');
        const cutName = file.name.split('.');
        const extension = cutName[cutName.length - 1];
        if (!validExtensions.includes(extension)) return reject(`La extensión ${extension} no es permitida - ${validExtensions}`);
        const idFile = `${uuidv4()}.${extension}`;

        if (await existDirectory(uploads)) {
            if (await existDirectory(folderService)) {
                const files = await getFiles(folderService);
                if (typeof (files) === 'string') reject(files);
                if (files.length < 3) {
                    file.mv(path.join(folderService, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        resolve(JSON.stringify({ nameFile: idFile, directoryFile: folderService, fullDirectory: path.join(folderService, idFile) }));
                    });
                } else {
                    reject(`No puedes subir mas imágenes, Solo se permiten ${numberFiles} archivos por servicio`)
                }
            } else {
                if (await createFolder(folderService)) {
                    file.mv(path.join(folderService, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        resolve(JSON.stringify({ nameFile: idFile, directoryFile: folderService, fullDirectory: path.join(folderService, idFile) }));
                    });
                } else {
                    reject(`Error al crear el directorio ${folderService}`)
                }
            }
        } else {
            if (await createFolder(uploads)) {
                if (await createFolder(folderService)) {
                    file.mv(path.join(folderService, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        resolve(JSON.stringify({ nameFile: idFile, directoryFile: folderService, fullDirectory: path.join(folderService, idFile) }));
                    });
                } else {
                    reject(`Error al crear el directorio ${folderService}`)
                }
            } else {
                reject(`Error al crear el directorio ${uploads}`);
            }
        }
    })
}
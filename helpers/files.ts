import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import util from 'util';
import { mkdir, access } from 'fs';

const existDirectory = async (directory: string) => {
    return new Promise((resolve, reject) => {
        access(directory, err => (err) ? reject('Error') : resolve('Correct'));
    }).then(() => true).catch(() => false);
}

const createDirectory = async (directory: string) => {
    const makeDir = util.promisify(mkdir);
    return await makeDir(directory, { recursive: true }).then(() => true).catch(() => false);
}

export const upLoadFile = async ({ files, validExtensions = ['png', 'jpg', 'jpeg', 'gif'], carpeta = '' }: { files: fileUpload.FileArray, validExtensions?: Array<string>, carpeta?: string }) => {

    return await new Promise(async (resolve, reject) => {
        let isExistDirectory: boolean = false;
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
                file.mv(path.join(folderService, idFile), (err) => {
                    if (err) reject(`Error: ${err}`);
                    resolve(idFile);
                });
            } else {
                if (await createDirectory(folderService)) {
                    console.log('2', folderService);
                    file.mv(path.join(folderService, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        resolve(idFile);
                    });
                } else {
                    reject(`Error al crear el directorio ${folderService}`)
                }
            }
        } else {
            if (await createDirectory(uploads)) {
                if (await createDirectory(folderService)) {
                    file.mv(path.join(folderService, idFile), (err) => {
                        if (err) reject(`Error: ${err}`);
                        resolve(idFile);
                    });
                } else {
                    reject(`Error al crear el directorio ${folderService}`)
                }
            } else {
                reject(`Error al crear el directorio ${uploads}`);
            }
        }
    });
}
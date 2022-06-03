"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upLoadFile = exports.deleteDirectory = exports.deleteFile = exports.getFiles = exports.createFolder = exports.existDirectory = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const existDirectory = (directory) => __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve, reject) => {
        (0, fs_1.access)(directory, err => (err) ? reject(false) : resolve(true));
    }).then(resp => resp).catch(err => false);
});
exports.existDirectory = existDirectory;
const createFolder = (directory) => __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve, reject) => {
        (0, node_fs_1.mkdir)(directory, { recursive: true }, (err) => { (err) ? reject(`Directorio [ ${directory} ] no creado`) : resolve(true); });
    }).then(() => true).catch(err => { console.log(`--> createFolder`, err); return false; });
});
exports.createFolder = createFolder;
const getFiles = (directory) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, promises_1.readdir)(directory).then(files => files).catch(err => { console.log(`-->getFiles`, err); return `${err}`; }); });
exports.getFiles = getFiles;
const deleteFile = (directoryFile) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, promises_1.unlink)(directoryFile).then(() => true).catch(err => `${err}`); });
exports.deleteFile = deleteFile;
const deleteDirectory = (folder) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, promises_1.rmdir)(folder, { recursive: true }).then(() => true).catch(err => `${err}`); });
exports.deleteDirectory = deleteDirectory;
const upLoadFile = ({ files, validExtensions = ['png', 'jpg', 'jpeg'], carpeta = '', type }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const numberFiles = 3;
        const { file } = files;
        if (Array.isArray(file))
            return reject('Error de archivo...  revisar');
        const uploads = path_1.default.join(__dirname, `../../uploads`, type, carpeta);
        const cutName = file.name.split('.');
        const extension = cutName[cutName.length - 1];
        if (!validExtensions.includes(extension))
            return reject(`La extensión ${extension} no es permitida - ${validExtensions}`);
        const idFile = `${(0, uuid_1.v4)()}.${extension}`;
        if (!(yield (0, exports.existDirectory)(uploads))) {
            if (yield (0, exports.createFolder)(uploads)) {
                return file.mv(path_1.default.join(uploads, idFile), (err) => {
                    if (err)
                        return reject(`Error: ${err}`);
                    return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                });
            }
            else
                return reject(`Error al crear el directorio ${uploads}`);
        }
        else {
            if (type === 'Service') {
                const files = yield (0, exports.getFiles)(uploads);
                if (Array.isArray(files) && files.length < 3) {
                    return file.mv(path_1.default.join(uploads, idFile), (err) => {
                        if (err)
                            return reject(`Error: ${err}`);
                        return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                    });
                }
                return reject(`No puedes subir mas imágenes, Solo se permiten ${numberFiles} archivos por servicio`);
            }
            if (type === 'Person' || type === 'Enterprice') {
                const files = yield (0, exports.getFiles)(uploads);
                if (Array.isArray(files))
                    for (const file of files) {
                        yield (0, exports.deleteFile)(path_1.default.join(uploads, file));
                    }
                ;
                return file.mv(path_1.default.join(uploads, idFile), (err) => {
                    if (err)
                        return reject(`Error: ${err}`);
                    return resolve({ nameFile: idFile, directoryFile: uploads, fullDirectory: `/files/getImg?type=${type}&id=${carpeta}&img=${idFile}` });
                });
            }
            return reject(`Propiedad no contemplada`);
        }
    })).then(resp => resp).catch(err => `${err}`);
});
exports.upLoadFile = upLoadFile;
//# sourceMappingURL=files.js.map
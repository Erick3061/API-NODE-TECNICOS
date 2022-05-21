import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { pool1, pool2 } from '../db/connection';
import adminRoutes from '../routes/admin';
import authRoutes from '../routes/auth';
import sysRoutes from '../routes/sys';
import filesRoutes from '../routes/files';
import fs from 'fs';
import fileUpload from 'express-fileupload';


/*Servers */
import https from 'https';
import http from 'http';


import { createServer } from 'http';
import Task from './task';
import { json } from 'express';

class Server {

    private app: Application;
    private port: string;
    public Con1: boolean = false;
    public Con2: boolean = false;
    public Task: Task | undefined;
    private server: http.Server;

    private apiPaths = {
        adminRoutes: '/api/admin',
        authRoutes: '/api/auth',
        sysRoutes: '/api/sys',
        filesRoutes: '/api/files',
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3007';
        /*Para servdior seguro quitar comentarios */
        this.server = https.createServer({
            key: fs.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.key'),
            cert: fs.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.crt')
        }, this.app);

        // this.server = http.createServer(this.app);
        this.middlewares();
        this.routes();
        this.connectDB(0);
    }

    async connectDB(intent: number) {
        pool1.connect()
            .then(async () => {
                this.Con1 = true;
                console.log('Conexion exitosa TECNICOS');
                await this.coonectMW(0);
            })
            .catch(() => {
                console.log('Error al conectar TECNICOS --> Reintentando conectar a TECNICOS...');
                if (intent < 5) {
                    setTimeout(() => this.connectDB(intent + 1), 3000);
                } else {
                    console.log('Se detuvo el proceso, no se pudo conectar a la base de datos');
                    process.exit(0);
                }

            });
    }
    async coonectMW(intent: number) {
        if (this.Con1)
            pool2.connect()
                .then(async () => {
                    this.Con1 = true;
                    console.log('Conexion exitosa SISTEMA MW');
                    this.Task = new Task();
                })
                .catch(() => {
                    console.log('Error al conectar SISTEMA MW --> Reintentando conectar a SISTEMA MW...');
                    if (intent < 5) {
                        setTimeout(() => this.coonectMW(intent + 1), 3000);
                    } else {
                        console.log('Se detuvo el proceso, no se pudo conectar a la base de datos');
                        process.exit(0);
                    }
                });
    }

    middlewares() {
        // CORS
        this.app.use(cors());
        // Lectura body
        this.app.use(express.json());
        // Carpeta publica
        this.app.use(express.static('../public'));
        // Morgan
        this.app.use(morgan("dev"));
        //File upload
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }

    routes() {
        this.app.use(this.apiPaths.adminRoutes, adminRoutes);
        this.app.use(this.apiPaths.authRoutes, authRoutes);
        this.app.use(this.apiPaths.sysRoutes, sysRoutes);
        this.app.use(this.apiPaths.filesRoutes, filesRoutes);
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port);
        });
    }

}

export default Server;

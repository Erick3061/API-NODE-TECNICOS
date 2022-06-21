import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { pool1 } from '../db/connection';
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

/**
 *Clase servidor
 */
class Server {

    private app: Application;
    private port: string;
    private mode: string;
    public Con1: boolean = false;
    public Con2: boolean = false;
    public Task: Task | undefined;
    private server: http.Server | https.Server;
    private apiPaths = {
        adminRoutes: '/api/admin',
        authRoutes: '/api/auth',
        sysRoutes: '/api/sys',
        filesRoutes: '/api/files',
    };

    /**
     * Constructor de la clase
     */
    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3007';
        this.mode = process.env.NODE_ENV || 'desarrollo';
        this.server = (this.mode === 'desarrollo')
            ? http.createServer(this.app)
            : https.createServer({
                key: fs.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.key'),
                cert: fs.readFileSync('/home/serv-dp/Documentos/NODE/CERTIFICADO/pem-sa_ddns_me.crt')
            }, this.app);
        this.middlewares();
        this.routes();
        this.connectDB(0);
    }

    /**
     * Realiza la conexón a la base de datos TECNCOS
     * @param {number} intent número de intentos 
     */
    async connectDB(intent: number) {
        pool1.connect()
            .then(async () => {
                this.Con1 = true;
                this.Task = new Task();
                console.log('Conexion exitosa TECNICOS');
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

    /**
     * Middlewares
     */
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

    /**
     * Rutasvalidas pra el servidor
     */
    routes() {
        this.app.use(this.apiPaths.adminRoutes, adminRoutes);
        this.app.use(this.apiPaths.authRoutes, authRoutes);
        this.app.use(this.apiPaths.sysRoutes, sysRoutes);
        this.app.use(this.apiPaths.filesRoutes, filesRoutes);
    }

    /**
     * Método que manda a correr el servidor
     */
    listen() {
        console.log(this.mode);
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port);
        });
    }

}

export default Server;

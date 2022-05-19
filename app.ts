import dotenv from 'dotenv';
import Server from './models/server';
// configurar dotenv
export const env = dotenv.config();
export const server = new Server();
server.listen();
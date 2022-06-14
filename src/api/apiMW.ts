import axios, { AxiosRequestHeaders } from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const baseURL = process.env.APIMW || 'https://pem-sa.ddns.me:3018/monitoring';
/** @module API-MW */

/**
 * @description Metodo axios para obtener los datos de la Api - MW
 * @param {String} endpoint ruta de la la interfaz de programación de aplicación de Monitoring works
 * @param {Object} data Objeto si es una peticion POST
 * @param {String} method 'GET' | 'POST'
 * @returns {Object<{Promise<AxiosResponse<any, any>>}>}
 */
export const apiMW = async (endpoint: string, data: object = {}, method: 'GET' | 'POST' = 'GET') => {
    const url = `${baseURL}/${endpoint}`;
    console.log(url);
        
    const headers: AxiosRequestHeaders | undefined = {};
    Object.assign(headers, { 'Content-type': 'application/json' });
    return (method === 'GET') ? axios({ method, url }) : axios({ method, url, data });
}
export default apiMW;
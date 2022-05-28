import axios, { AxiosRequestHeaders } from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const baseURL = process.env.APIMW || 'http://127.0.0.1:3012/api/mw';
export const apiMW = async (endpoint: string, data: object = {}, method: 'GET' | 'POST' = 'GET') => {
    const url = `${baseURL}/${endpoint}`;
    const headers: AxiosRequestHeaders | undefined = {};
    Object.assign(headers, { 'Content-type': 'application/json' });
    return (method === 'GET') ? axios({ method, url }) : axios({ method, url, data });
}
export default apiMW;
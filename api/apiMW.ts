import axios, { AxiosRequestHeaders } from 'axios';
// const baseURL = 'http://pem-sa.ddns.me:3012/api/mw';
const baseURL = 'http://127.0.0.1:3012/api/mw';
export const apiMW = async (endpoint: string, data: object = {}, method: 'GET' | 'POST' = 'GET') => {
    const url = `${baseURL}/${endpoint}`;
    const headers: AxiosRequestHeaders | undefined = {};
    Object.assign(headers, { 'Content-type': 'application/json' });
    return (method === 'GET') ? axios({ method, url }) : axios({ method, url, data });
}
export default apiMW;
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
    user: process.env.DBTEC_USER || 'sa',
    password: process.env.DBTEC_PASSWORD || 'desarrollo',
    server: process.env.DBTEC_SERVER || 'localhost',
    database: process.env.DBTEC_DATABASE || 'TECNICOS',
    port: process.env.DBTEC_PORT ? parseInt(process.env.DBTEC_PORT) : 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

const configMWS: sql.config = {
    user: process.env.MW_USER || 'sa',
    password: process.env.MW_PASSWORD || 'siatecMexico2014=)(',
    server: process.env.MW_SERVER || '192.168.1.130',
    database: process.env.MW_DATABASE || 'C:\\SIATEC\\SIATECINFO\\SISTEMA',
    port: process.env.MW_PORT ? parseInt(process.env.MW_PORT) : 14333,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

export const pool1 = new sql.ConnectionPool(config);
export const pool2 = new sql.ConnectionPool(configMWS);
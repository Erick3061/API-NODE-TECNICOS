import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
    user: process.env.DBTEC_USER || 'dev',
    password: process.env.DBTEC_PASSWORD || 'desarrollo',
    server: process.env.DBTEC_SERVER || 'localhost',
    database: process.env.DBTEC_DATABASE || 'TECNICOS',
    port: process.env.DBTEC_PORT ? parseInt(process.env.DBTEC_PORT) : 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

export const pool1 = new sql.ConnectionPool(config);
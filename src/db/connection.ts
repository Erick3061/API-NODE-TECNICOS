import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
    user: process.env.DBTEC_USER || 'sa',
    password: process.env.DBTEC_PASSWORD || 'Pemsa850827+',
    server: process.env.DBTEC_SERVER || 'services.pem-sa.com.mx',
    database: process.env.DBTEC_DATABASE || 'TECNICOS',
    port: process.env.DBTEC_PORT ? parseInt(process.env.DBTEC_PORT) : 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

export const pool1 = new sql.ConnectionPool(config);
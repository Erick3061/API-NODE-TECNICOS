import sql from 'mssql';
const config = {
    user: 'sa',
    // password: 'desarrollo',
    password: 'Pemsa850827+',
    // server: 'localhost',
    server: 'pem-sa.ddns.me',
    database: 'TECNICOS',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

// const config = {
//     user: 'sa',
//     password: 'desarrollo',
//     server: '127.0.0.1',
//     database: 'TECNICOS',
//     port: 1433,
//     options: {
//         encrypt: false,
//         trustServerCertificate: true // change to true for local dev / self-signed certs
//     }
// }

const configMWS = {
    user: "sa",
    password: 'siatecMexico2014=)(',
    server: 'comunicador-ip.ddns.net',
    database: "C:\\SIATEC\\SIATECINFO\\SISTEMA",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

export const pool1 = new sql.ConnectionPool(config);
export const pool2 = new sql.ConnectionPool(configMWS);
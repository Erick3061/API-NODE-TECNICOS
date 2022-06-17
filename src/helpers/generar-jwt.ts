import jwt from 'jsonwebtoken';
export const SECRETORPPRIVATEKEY = 'P3Ms43zTP3Ms467P3Ms4mV54rIYP3MS4';

/**@module GENERAR_JWT */

/**
 * Crea un JSON WEB TOKEN
 * @param {string} uid id de la persona 
 * @param {number} role rol que desempeña la persona
 * @returns {Promise<{ token: string } | { error: string }>}
 */
export const generarJWT = async (uid: string, role: number) => {
    let expiresIn: string = (role === 1) ? '2h' : (role === 2) ? '12h' : (role === 3) ? '8h' : '10h';
    return await new Promise((resolve, reject) => {
        const payload = { uid };
        const clave = SECRETORPPRIVATEKEY;
        jwt.sign(payload, clave, { expiresIn }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se generó el token');
            } else {
                resolve(token);
            }
        });
    })
        .then(resp => { return { token: `${resp}` }; })
        .catch(err => { return { error: `${err}` }; });
}

/**
 * Decodifica el token enviado
 * @param {string} token token enviado 
 * @returns {jwt.JwtPayload | undefined}
 */
export const decodeJWT = (token: string) => {
    const decode: string | jwt.JwtPayload | null = jwt.decode(token);
    if (decode !== null && typeof (decode) !== 'string') return decode;
}
import { RERROR } from "../rules/interfaces";

/** @module ERROR_CONTROLLER */

/**
 * @name rError
 * @description Retorna el error generado por alguna exepción Response de express
 * @param {Object<{ location:String }>} RERROR parametros para mandar el error
 * @response {Object} response
 * @response {False} response.status Estado de la petición
 * @response {Array} response.errors Errores en la petición
 */
export const rError = ({ location, msg, resp, status, param, value }: RERROR) => {
    return resp.status(status ? status : 500).json({ status: false, errors: [{ value: (value) ? value : '', msg, location: (location) ? location : '', param: (param) ? param : '', }] });
}
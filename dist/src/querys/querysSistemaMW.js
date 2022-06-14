"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersMon = void 0;
const apiMW_1 = __importDefault(require("../api/apiMW"));
const functions_1 = require("../functions/functions");
/**@module CONSULTAS_SISTEMA_MONITORING-WORKS */
/**
 * @name getUsersMon
 * @description Obtiene todos los usuarios y contraseñas de los monitoristas de Mw
 * @path {GET} /api/sys/getUsersMon
 * @header {String} x-token -Requiere Json Web Token generado al iniciar sesión
 * @response {Object} response
 * @response {Boolean} response.status Estado de la petición
 * @response {Array} [response.errors] Errores en la petición
 * @response {Object} [response.data] Datos en caso de respuesta satisfactoria
 */
const getUsersMon = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, apiMW_1.default)(`system-users`, {}, 'GET');
        const { status, data, errors } = response.data;
        // const { rowsAffected, recordset }: IResult<resp> = await pool2.request().query(`select CodigoUsuario, Contraseña as password, Nombre from Usuario where Inactivo='false'`);
        if (status && data) {
            return resp.status(200).json({
                status: true,
                data: {
                    users: data.usuarios.map(el => { return { user: el.CodigoUsuario.trim(), password: (0, functions_1.DecriptRot39)(el.password.trim()), name: el.Nombre.trim() }; })
                }
            });
        }
        else {
            return resp.status(400).json({
                status: false,
                errors
            });
        }
    }
    catch (error) {
        resp.status(500).json({
            status: false,
            errors: [
                {
                    value: '',
                    msg: `Error en el servidor. Error: ${error}`,
                    location: 'getUsersMon',
                    param: '',
                }
            ]
        });
    }
});
exports.getUsersMon = getUsersMon;
//# sourceMappingURL=querysSistemaMW.js.map
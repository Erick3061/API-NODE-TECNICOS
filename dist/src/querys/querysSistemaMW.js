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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersMon = void 0;
const connection_1 = require("../db/connection");
const functions_1 = require("../functions/functions");
const getUsersMon = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowsAffected, recordset } = yield connection_1.pool2.request().query(`select CodigoUsuario, Contraseña as password, Nombre from Usuario where Inactivo='false'`);
        if (rowsAffected[0] !== 0) {
            return resp.json({
                status: true,
                data: {
                    users: recordset.map(el => { return { user: el.CodigoUsuario.trim(), password: (0, functions_1.DecriptRot39)(el.password.trim()), name: el.Nombre.trim() }; })
                }
            });
        }
        else {
            return resp.status(200).json({
                status: false,
                errors: [
                    {
                        value: '',
                        msg: 'Error al obtener Usuarios MW',
                        location: 'getUsersMon',
                        param: '',
                    }
                ]
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const filesController_1 = require("../controller/filesController");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const validar_campos_1 = require("../middlewares/validar_campos");
const router = (0, express_1.Router)();
router.get('/getImg', [], filesController_1.sendFile);
router.get('/getImgs/:id/:type', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id')
        .notEmpty().withMessage('Campo id requerido').bail(),
    (0, express_validator_1.check)('type')
        .notEmpty().withMessage('tipo requerido')
        .isIn(['Service', 'Person', 'Enterprice']).withMessage('Propiedad no valida').bail(),
    validar_campos_1.validarCampos
], filesController_1.getImgs);
router.post('/deleteFileToService', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id_service')
        .notEmpty().withMessage('Campo id requerido')
        .isString().withMessage('Debe ser un string').bail(),
    (0, express_validator_1.check)('file')
        .notEmpty().withMessage('Campo file requerido')
        .isString().withMessage('Debe ser un string').bail(),
    validar_campos_1.validarCampos
], filesController_1.deleteFileToService);
/**Cuando se corrijan los ids de la tabla de empresas se agregara la subida de imagenes*/
router.put('/loadFile/:id/:type', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id')
        .notEmpty().withMessage('Campo id requerido').bail(),
    (0, express_validator_1.check)('type')
        .notEmpty().withMessage('tipo requerido')
        .isIn(['Service', 'Person', 'Enterprice']).withMessage('Propiedad no valida').bail(),
    validar_campos_1.validarCampos
], filesController_1.loadFile);
exports.default = router;
//# sourceMappingURL=files.js.map
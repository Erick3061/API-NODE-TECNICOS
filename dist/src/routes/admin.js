"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const adminController_1 = require("../controller/adminController");
const querysSistemaMW_1 = require("../querys/querysSistemaMW");
const db_validators_1 = require("../helpers/db-validators");
const validar_campos_1 = require("../middlewares/validar_campos");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const router = (0, express_1.Router)();
router.post('/addEnterprice', [
    // validarJWT,
    (0, express_validator_1.check)('enterprice')
        .notEmpty().withMessage('Campo Empresa requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom(db_validators_1.validEnterprice).bail(),
    validar_campos_1.validarCampos
], adminController_1.addEnterprice);
router.post('/addPerson', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('enterprice')
        .notEmpty().withMessage('Campo Empresa requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom(db_validators_1.existEnterprice).bail(),
    (0, express_validator_1.check)('role')
        .notEmpty().withMessage('Campo Rol requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom((value, { req }) => (0, db_validators_1.existRole)(value, req)).bail(),
    (0, express_validator_1.check)('name')
        .notEmpty().withMessage('Campo Nombre requerido').bail(),
    (0, express_validator_1.check)('lastname')
        .notEmpty().withMessage('Campo Apellidos requerido').bail(),
    (0, express_validator_1.check)('email')
        .custom(db_validators_1.existEmail).bail(),
    (0, express_validator_1.check)('password')
        .notEmpty().withMessage('Campo Password requerido').bail(),
    validar_campos_1.validarCampos,
], adminController_1.addPerson);
router.post('/enterpriceActions', [
    // validarJWT,
    (0, express_validator_1.check)('enterprice')
        .notEmpty().withMessage('el id de la empresa es requerido')
        .isObject().withMessage('Empresa Debe ser un objecto')
        .custom(db_validators_1.existEnterprice).bail(),
    (0, express_validator_1.check)('option')
        .notEmpty().withMessage('Campo Acción requerido')
        .isObject().withMessage('Acción Debe ser un objecto')
        .custom(db_validators_1.validateOptionUpdateEnterprice).bail(),
    validar_campos_1.validarCampos,
], adminController_1.actionsEnterprice);
router.post('/personActions', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('person')
        .notEmpty().withMessage('el id de la persona es requerido')
        .isObject().withMessage('Acción Debe ser un objecto')
        .custom(db_validators_1.ExistPersonInDB).bail(),
    (0, express_validator_1.check)('option')
        .notEmpty().withMessage('Campo Acción requerido').bail()
        .isObject().withMessage('Acción Debe ser un objecto').bail()
        .custom(db_validators_1.validateOptionUpdatePerson).bail(),
    validar_campos_1.validarCampos,
], adminController_1.actionsPerson);
router.get('/getGeneral', [validar_jwt_1.validarJWT, validar_campos_1.validarCampos], adminController_1.getGeneral);
router.get('/getUsersMon', [validar_jwt_1.validarJWT, validar_campos_1.validarCampos], querysSistemaMW_1.getUsersMon);
exports.default = router;
//# sourceMappingURL=admin.js.map
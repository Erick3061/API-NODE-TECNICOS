"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const sysController_1 = require("../controller/sysController");
const db_validators_1 = require("../helpers/db-validators");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const validar_campos_1 = require("../middlewares/validar_campos");
const querysTecnicos_1 = require("../querys/querysTecnicos");
const router = (0, express_1.Router)();
router.post('/addService', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('grantedEntry')
        .notEmpty().withMessage('Campo monitorista requerido')
        .custom(db_validators_1.ExistPersonInDB).bail(),
    (0, express_validator_1.check)('id_type')
        .notEmpty().withMessage('Campo tipo requerido')
        .isNumeric().withMessage('id_type debe ser un dato numerico')
        .custom(db_validators_1.existTypeService).bail(),
    (0, express_validator_1.check)('CodigoCte').notEmpty().withMessage('Debes seleccionar una cuenta').bail(),
    (0, express_validator_1.check)('isKeyCode')
        .notEmpty().withMessage('Campo: ver claves requerido')
        .isBoolean().withMessage('Debe ser un valor booleano').bail(),
    (0, express_validator_1.check)('isOpCi')
        .notEmpty().withMessage('Campo: aperturas y cierres requerido')
        .isBoolean().withMessage('Debe ser un valor booleano').bail(),
    (0, express_validator_1.check)('technicals')
        .notEmpty().withMessage('Campo de Tecnico o tecnicos Requerido')
        .isArray().withMessage('Este debe ser un arreglo de strings')
        .custom(db_validators_1.existTechnicals).bail(),
    (0, express_validator_1.check)('time')
        .notEmpty().withMessage('Campo horas requerido')
        .isObject().withMessage('Debe ser un objeto').bail(),
    validar_campos_1.validarCampos
], sysController_1.addService);
router.get('/getAccountsMW', [validar_jwt_1.validarJWT, validar_campos_1.validarCampos], sysController_1.getAccountsMW);
router.get('/getActiveServices', [validar_jwt_1.validarJWT, validar_campos_1.validarCampos], sysController_1.getActiveServices);
router.get('/getDisponibleTechnicals', [validar_jwt_1.validarJWT], sysController_1.getDisponibleTechnicals);
router.get('/getEvents/:id_service/:start/:end', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id_service').notEmpty().withMessage('servicio requerido').bail(),
    (0, express_validator_1.check)('start').notEmpty().withMessage('servicio requerido')
        .custom(() => true).bail(),
    (0, express_validator_1.check)('end').notEmpty().withMessage('servicio requerido')
        .custom(() => true).bail(),
    validar_campos_1.validarCampos
], sysController_1.getEvents);
router.get('/getInServiceTechnicals', [validar_jwt_1.validarJWT], sysController_1.getInServiceTechnicals);
router.get('/getPersons/:role', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('role')
        .notEmpty().withMessage('Campo id requerido')
        .isNumeric().withMessage('Debe ser un número')
        .custom(db_validators_1.existRoleinDB).bail(),
    validar_campos_1.validarCampos
], sysController_1.getPersons);
router.get('/getServiceDetails/:id', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id').notEmpty().withMessage('Campo id requerido').bail(),
    validar_campos_1.validarCampos
], querysTecnicos_1.GetActiveServices);
router.get('/getServices/:start/:end', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('start')
        .notEmpty().withMessage('Campo fecha inicio requerido')
        .custom(db_validators_1.isDate).bail(),
    (0, express_validator_1.check)('end')
        .notEmpty().withMessage('Campo fecha final requerido')
        .custom(db_validators_1.isDate).bail(),
    validar_campos_1.validarCampos
], sysController_1.getServices);
router.get('/getTask', [], sysController_1.getTask);
router.get('/getVersionApp', [], sysController_1.geyVersionApp);
router.post('/modTechnicalToAService', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id_service').notEmpty().withMessage('Campo servicio requerido').bail(),
    (0, express_validator_1.check)('technicals')
        .notEmpty().withMessage('Campo de Tecnico o tecnicos Requerido')
        .isArray().withMessage('Este debe ser un arreglo de strings')
        .custom((value, { req }) => (0, db_validators_1.existTechnicals)(value, req.query)).bail(),
    validar_campos_1.validarCampos
], sysController_1.modTechnicalToAService);
router.post('/updateService', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id_service').notEmpty().withMessage('Campo servicio requerido').bail(),
    (0, express_validator_1.check)('person')
        .notEmpty().withMessage('Campo persona requerido')
        .isObject().withMessage('Debe ser un objeto')
        .custom(db_validators_1.ExistPersonInDB).bail(),
    (0, express_validator_1.check)('prop')
        .notEmpty().withMessage('Campo propiedad requerido')
        .isIn(['isKeyCode', 'isDelivered', 'accountMW', 'firstVerification', 'secondVerification', 'moreTime', 'SF', 'EF', 'TS']).withMessage('Propiedad no valida').bail(),
    validar_campos_1.validarCampos
], sysController_1.updateService);
router.get('/updateTask', [], sysController_1.updateTask);
router.get('/verifyEventsService/:id_service', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('id_service').notEmpty().withMessage('servicio requerido').bail(),
    validar_campos_1.validarCampos
], sysController_1.verifyEventsService);
router.post('/validatePassword', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('password').notEmpty().withMessage('password requerido').bail(),
    validar_campos_1.validarCampos
], sysController_1.verifyPassword);
exports.default = router;
//# sourceMappingURL=sys.js.map
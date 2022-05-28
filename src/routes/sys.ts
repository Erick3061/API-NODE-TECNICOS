import { Router } from "express";
import { check } from 'express-validator';
import { addService, getAccountsMW, getActiveServices, getDisponibleTechnicals, getEvents, getInServiceTechnicals, getPersons, getService, getServices, getTask, geyVersionApp, modTechnicalToAService, updateService, updateTask, verifyEventsService, verifyPassword } from "../controller/sysController";
import { ExistPersonInDB, existRoleinDB, existTechnicals, existTypeService, isDate } from "../helpers/db-validators";
import { validarJWT } from "../middlewares/validar-jwt";
import { validarCampos } from "../middlewares/validar_campos";
import { GetActiveServices } from "../querys/querysTecnicos";

const router = Router();

router.post('/addService', [
    validarJWT,
    check('grantedEntry')
        .notEmpty().withMessage('Campo monitorista requerido')
        .custom(ExistPersonInDB).bail(),
    check('id_type')
        .notEmpty().withMessage('Campo tipo requerido')
        .isNumeric().withMessage('id_type debe ser un dato numerico')
        .custom(existTypeService).bail(),
    check('CodigoCte').notEmpty().withMessage('Debes seleccionar una cuenta').bail(),
    check('isKeyCode')
        .notEmpty().withMessage('Campo: ver claves requerido')
        .isBoolean().withMessage('Debe ser un valor booleano').bail(),
    check('isOpCi')
        .notEmpty().withMessage('Campo: aperturas y cierres requerido')
        .isBoolean().withMessage('Debe ser un valor booleano').bail(),
    check('technicals')
        .notEmpty().withMessage('Campo de Tecnico o tecnicos Requerido')
        .isArray().withMessage('Este debe ser un arreglo de strings')
        .custom(existTechnicals).bail(),
    check('time')
        .notEmpty().withMessage('Campo horas requerido')
        .isObject().withMessage('Debe ser un objeto').bail(),
    validarCampos
], addService);

router.get('/getAccountsMW', [validarJWT, validarCampos], getAccountsMW);

router.get('/getActiveServices', [validarJWT, validarCampos], getActiveServices);

router.get('/getDisponibleTechnicals', [validarJWT], getDisponibleTechnicals);

router.get('/getEvents/:id_service/:start/:end', [
    validarJWT,
    check('id_service').notEmpty().withMessage('servicio requerido').bail(),
    check('start').notEmpty().withMessage('servicio requerido')
        .custom(() => true).bail(),
    check('end').notEmpty().withMessage('servicio requerido')
        .custom(() => true).bail(),
    validarCampos
], getEvents);

router.get('/getInServiceTechnicals', [validarJWT], getInServiceTechnicals);

router.get('/getPersons/:role', [
    validarJWT,
    check('role')
        .notEmpty().withMessage('Campo id requerido')
        .isNumeric().withMessage('Debe ser un número')
        .custom(existRoleinDB).bail(),
    validarCampos
], getPersons);

router.get('/getServiceDetails/:id', [
    validarJWT,
    check('id').notEmpty().withMessage('Campo id requerido').bail(),
    validarCampos
], GetActiveServices);

router.get('/getServices/:start/:end', [
    validarJWT,
    check('start')
        .notEmpty().withMessage('Campo fecha inicio requerido')
        .custom(isDate).bail(),
    check('end')
        .notEmpty().withMessage('Campo fecha final requerido')
        .custom(isDate).bail(),
    validarCampos
], getServices);

router.get('/getTask', [], getTask);

router.get('/getVersionApp', [], geyVersionApp);

router.post('/modTechnicalToAService', [
    validarJWT,
    check('id_service').notEmpty().withMessage('Campo servicio requerido').bail(),
    check('technicals')
        .notEmpty().withMessage('Campo de Tecnico o tecnicos Requerido')
        .isArray().withMessage('Este debe ser un arreglo de strings')
        .custom((value, { req }) => existTechnicals(value, req.query)).bail(),
    validarCampos
], modTechnicalToAService);

router.post('/updateService', [
    validarJWT,
    check('id_service').notEmpty().withMessage('Campo servicio requerido').bail(),
    check('person')
        .notEmpty().withMessage('Campo persona requerido')
        .isObject().withMessage('Debe ser un objeto')
        .custom(ExistPersonInDB).bail(),
    check('prop')
        .notEmpty().withMessage('Campo propiedad requerido')
        .isIn(['isKeyCode', 'isDelivered', 'accountMW', 'firstVerification', 'secondVerification', 'moreTime', 'SF', 'EF', 'TS']).withMessage('Propiedad no valida').bail(),
    validarCampos
], updateService);

router.get('/updateTask', [], updateTask);

router.get('/verifyEventsService/:id_service', [
    validarJWT,
    check('id_service').notEmpty().withMessage('servicio requerido').bail(),
    validarCampos
], verifyEventsService);

router.post('/validatePassword', [
    validarJWT,
    check('password').notEmpty().withMessage('password requerido').bail(),
    validarCampos
], verifyPassword);

export default router;
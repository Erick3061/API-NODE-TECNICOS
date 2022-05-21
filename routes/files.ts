import { Router } from 'express';
import { check } from 'express-validator';
import { loadFile, sendFile, deleteFileToService } from '../controller/filesController';
import { validarCampos } from '../middlewares/validar_campos';
import { validarJWT } from '../middlewares/validar-jwt';

const router = Router();

router.get('/getImg', [
    validarJWT,
    validarCampos
], sendFile);

router.post('/deleteFileToService', [
    validarJWT,
    check('id_service')
        .notEmpty().withMessage('Campo id requerido')
        .isString().withMessage('Debe ser un string').bail(),
    check('file')
        .notEmpty().withMessage('Campo file requerido')
        .isString().withMessage('Debe ser un string').bail(),
    validarCampos
], deleteFileToService);

router.post('/loadFile', [
    validarJWT,
    check('id_service').notEmpty().withMessage('Campo id requerido').bail(),
    validarCampos
], loadFile);

export default router;
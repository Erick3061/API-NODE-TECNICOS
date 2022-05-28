import { Router } from 'express';
import { check } from 'express-validator';
import { deleteFileToService, getImgs, loadFile, sendFile } from '../controller/filesController';
import { validarJWT } from '../middlewares/validar-jwt';
import { validarCampos } from '../middlewares/validar_campos';

const router = Router();

router.get('/getImg', [], sendFile);

router.get('/getImgs/:id/:type', [
    validarJWT,
    check('id')
        .notEmpty().withMessage('Campo id requerido').bail(),
    check('type')
        .notEmpty().withMessage('tipo requerido')
        .isIn(['Service', 'Person', 'Enterprice']).withMessage('Propiedad no valida').bail(),
    validarCampos
], getImgs);

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

/**Cuando se corrijan los ids de la tabla de empresas se agregara la subida de imagenes*/
router.put('/loadFile/:id/:type', [
    validarJWT,
    check('id')
        .notEmpty().withMessage('Campo id requerido').bail(),
    check('type')
        .notEmpty().withMessage('tipo requerido')
        .isIn(['Service', 'Person', 'Enterprice']).withMessage('Propiedad no valida').bail(),
    validarCampos
], loadFile);


export default router;
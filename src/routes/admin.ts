import { Router } from 'express';
import { check } from 'express-validator';
import { addPerson, getGeneral, actionsPerson, addEnterprice, actionsEnterprice } from "../controller/adminController";
import { getUsersMon } from "../querys/querysSistemaMW";
import { existEmail, existEnterprice, ExistPersonInDB, existRole, validateOptionUpdateEnterprice, validateOptionUpdatePerson, validEnterprice } from '../helpers/db-validators';
import { validarCampos } from '../middlewares/validar_campos';
import { validarJWT } from '../middlewares/validar-jwt';

const router = Router();
router.post('/addEnterprice', [
    // validarJWT,
    check('enterprice')
        .notEmpty().withMessage('Campo Empresa requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom(validEnterprice).bail(),
    validarCampos
], addEnterprice);

router.post('/addPerson', [
    validarJWT,
    check('enterprice')
        .notEmpty().withMessage('Campo Empresa requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom(existEnterprice).bail(),
    check('role')
        .notEmpty().withMessage('Campo Rol requerido').bail()
        .isObject().withMessage('enterprice Debe ser un objecto').bail()
        .custom((value, { req }) => existRole(value, req)).bail(),
    check('name')
        .notEmpty().withMessage('Campo Nombre requerido').bail(),
    check('lastname')
        .notEmpty().withMessage('Campo Apellidos requerido').bail(),
    check('email')
        .custom(existEmail).bail(),
    check('password')
        .notEmpty().withMessage('Campo Password requerido').bail(),
    validarCampos,
], addPerson);

router.post('/enterpriceActions', [
    // validarJWT,
    check('enterprice')
        .notEmpty().withMessage('el id de la empresa es requerido')
        .isObject().withMessage('Empresa Debe ser un objecto')
        .custom(existEnterprice).bail(),
    check('option')
        .notEmpty().withMessage('Campo Acción requerido')
        .isObject().withMessage('Acción Debe ser un objecto')
        .custom(validateOptionUpdateEnterprice).bail(),
    validarCampos,
], actionsEnterprice);

router.post('/personActions', [
    validarJWT,
    check('person')
        .notEmpty().withMessage('el id de la persona es requerido')
        .isObject().withMessage('Acción Debe ser un objecto')
        .custom(ExistPersonInDB).bail(),
    check('option')
        .notEmpty().withMessage('Campo Acción requerido').bail()
        .isObject().withMessage('Acción Debe ser un objecto').bail()
        .custom(validateOptionUpdatePerson).bail(),
    validarCampos,
], actionsPerson);

router.get('/getGeneral', [validarJWT, validarCampos], getGeneral);

router.get('/getUsersMon', [validarJWT, validarCampos], getUsersMon);

export default router;
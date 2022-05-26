import { Router } from "express";
import { check } from 'express-validator';
import { ChangePassword, ForgetPassword, LogIn, tokenValido } from "../controller/authController";
import { validarCampos } from "../middlewares/validar_campos";
import { validarJWT } from '../middlewares/validar-jwt';
const router = Router();

router.post('/logIn', [
    check("acceso")
        .notEmpty().withMessage('Campo usuario ó correo requerido').bail(),
    validarCampos,
    check('password')
        .notEmpty().withMessage(`Campo contraseña requerido`).bail(),
    validarCampos
], LogIn);

router.get('/validaJWT', [
    validarJWT
], tokenValido);

router.post('/changePassword', [
    validarJWT,
    check('password')
        .notEmpty().withMessage(`Campo contraseña requerido`).bail(),
    validarCampos
], ChangePassword);

router.post('/resetPassword', [
    check("acceso")
        .notEmpty().withMessage('Campo usuario ó correo requerido').bail(),
    validarCampos,
], ForgetPassword)

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controller/authController");
const validar_campos_1 = require("../middlewares/validar_campos");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const router = (0, express_1.Router)();
router.post('/logIn', [
    (0, express_validator_1.check)("acceso")
        .notEmpty().withMessage('Campo usuario ó correo requerido').bail(),
    validar_campos_1.validarCampos,
    (0, express_validator_1.check)('password')
        .notEmpty().withMessage(`Campo contraseña requerido`).bail(),
    validar_campos_1.validarCampos
], authController_1.LogIn);
router.get('/validaJWT', [
    validar_jwt_1.validarJWT
], authController_1.tokenValido);
router.post('/changePassword', [
    validar_jwt_1.validarJWT,
    (0, express_validator_1.check)('password')
        .notEmpty().withMessage(`Campo contraseña requerido`).bail(),
    validar_campos_1.validarCampos
], authController_1.ChangePassword);
router.post('/resetPassword', [
    (0, express_validator_1.check)("access")
        .notEmpty().withMessage('Campo usuario ó correo requerido').bail(),
    (0, express_validator_1.check)("name")
        .notEmpty().withMessage('Campo Nombre requerido').bail(),
    (0, express_validator_1.check)("lastName")
        .notEmpty().withMessage('Campo Apellidos requerido').bail(),
    (0, express_validator_1.check)("employeeNumber")
        .notEmpty().withMessage('Campo Número de empleado requerido').bail(),
    validar_campos_1.validarCampos,
], authController_1.ForgetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map
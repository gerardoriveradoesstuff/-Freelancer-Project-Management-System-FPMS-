const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");

router.post("/register", user.register);
router.post("/login", user.login);
router.post("/register-simple", user.registerSimple);
router.post("/login-simple", user.loginSimple);
router.post("/reset-password-simple", user.resetPasswordSimple);
router.post("/request-password-reset", user.requestPasswordReset);

module.exports = router;

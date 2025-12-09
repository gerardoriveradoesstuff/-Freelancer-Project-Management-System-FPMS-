const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");

router.post("/register", user.register);
router.post("/login", user.login);
router.post("/register-simple", user.registerSimple);
router.post("/login-simple", user.loginSimple);

module.exports = router;

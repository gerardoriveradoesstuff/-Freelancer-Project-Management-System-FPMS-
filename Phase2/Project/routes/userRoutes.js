const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");
const demo = require("../controllers/demoController");

router.post("/register", user.register);
router.post("/login", user.login);
router.post("/register-simple", user.registerSimple);
router.post("/login-simple", user.loginSimple);
router.post("/reset-password-simple", user.resetPasswordSimple);

router.get("/:id/dashboard", demo.getUserDashboard);
router.get("/:userId/profile", user.getUserProfileForViewer);
router.get("/:userId/reviews", user.getUserReviewsForViewer);
router.post("/:userId/reviews", user.addReviewForUser);

module.exports = router;

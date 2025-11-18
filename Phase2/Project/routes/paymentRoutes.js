const express = require("express");
const router = express.Router();
const payment = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/", auth, payment.createPayment);
router.get("/", auth, payment.getPayments);

module.exports = router;

const express = require("express");
const router = express.Router();
const message = require("../controllers/messageController");
const auth = require("../middleware/auth");

router.post("/", auth, message.sendMessage);
router.get("/", auth, message.getMessages);

module.exports = router;

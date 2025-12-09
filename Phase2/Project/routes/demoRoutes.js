const demo = require("../controllers/demoController");
const express = require("express");
const router = express.Router();

router.get("/evelyn", demo.getEvelynData);
router.post("/evelyn/seed", demo.seedEvelyn);
router.post("/project", demo.createProjectDemo);
router.post("/member", demo.addFreelancerToProjectDemo);
router.post("/task", demo.createTaskDemo);
router.post("/task/status", demo.updateTaskStatusDemo);
router.post("/message", demo.sendMessageDemo);
router.post("/message/read", demo.markMessageReadDemo);
router.post("/payment", demo.createPaymentDemo);

module.exports = router;

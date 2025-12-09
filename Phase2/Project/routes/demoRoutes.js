const demo = require("../controllers/demoController");
const express = require("express");
const router = express.Router();

router.get("/evelyn", demo.getEvelynData);
router.post("/evelyn/seed", demo.seedEvelyn);
router.get("/user/:id", demo.getUserDashboard);
router.post("/project", demo.createProjectDemo);
router.post("/member", demo.addFreelancerToProjectDemo);
router.post("/task", demo.createTaskDemo);
router.post("/task/status", demo.updateTaskStatusDemo);
router.post("/message", demo.sendMessageDemo);
router.post("/message/read", demo.markMessageReadDemo);
router.post("/payment", demo.createPaymentDemo);
router.post("/user/delete", demo.deleteDemoUser);
router.post("/message/delete-kickoff", demo.deleteKickoffMessageDemo);
router.post("/automation/complete-project-pay", demo.automationCompleteProjectAndPay);
router.post("/automation/assign-by-skill", demo.automationAssignBySkill);
router.post("/automation/remove-inactive-freelancers", demo.automationRemoveInactiveFreelancers);

router.get("/query/users", demo.queryUsers);
router.get("/query/freelancers", demo.queryFreelancers);
router.get("/query/projects-by-client", demo.queryProjectsByClient);
router.get("/query/tasks-by-project", demo.queryTasksByProject);
router.get("/query/messages-by-project", demo.queryMessagesByProject);
router.get("/query/payments-by-freelancer", demo.queryPaymentsByFreelancer);
router.get("/query/reviews-by-freelancer", demo.queryReviewsByFreelancer);
router.get("/query/task-count-per-project", demo.queryTaskCountPerProject);
router.get("/query/average-client-ratings", demo.queryAverageClientRatings);
router.get("/query/projects-with-three-tasks", demo.queryProjectsWithThreeTasks);

module.exports = router;

const express = require("express");
const router = express.Router();
const task = require("../controllers/taskController");
const auth = require("../middleware/auth");

router.post("/", auth, task.createTask);
router.get("/:id", auth, task.getProjectTasks);
router.post("/:taskId/complete-pay", task.completeTaskAndPay);
router.post("/create-assign", task.createTaskAndAssign);
router.post("/:taskId/assign", task.assignTask);
router.get("/:taskId/assignees", task.getTaskAssignees);

module.exports = router;

const express = require("express");
const router = express.Router();
const task = require("../controllers/taskController");
const auth = require("../middleware/auth");

router.post("/", auth, task.createTask);
router.get("/:id", auth, task.getProjectTasks);

module.exports = router;

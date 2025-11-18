const express = require("express");
const router = express.Router();
const project = require("../controllers/projectController");
const auth = require("../middleware/auth");

router.post("/", auth, project.createProject);
router.get("/", auth, project.getAllProjects);
router.get("/mine", auth, project.getClientProjects);

module.exports = router;

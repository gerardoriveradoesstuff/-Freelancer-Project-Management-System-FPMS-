const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.createProject);
router.post('/:id/member', projectController.addProjectMember);
router.get('/:id/members', projectController.getProjectMembers);

module.exports = router;

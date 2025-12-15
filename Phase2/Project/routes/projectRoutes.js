const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.createProject);
router.post('/:id/member', projectController.addProjectMember);
router.get('/:id/members', projectController.getProjectMembers);
router.post('/:id/complete-pay', projectController.completeProjectAndPay);
router.post('/:id/auto-pay-completed', projectController.autoPayCompletedMembers);
router.delete('/:id/member/:userId', projectController.removeProjectMember);
router.post('/:id/alerts/deadlines', projectController.alertDeadlineMissed);

module.exports = router;

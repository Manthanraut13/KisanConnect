const router = require('express').Router();
const grievanceController = require('../controllers/grievance.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, grievanceController.createGrievance);
router.get('/', authMiddleware, grievanceController.getMyGrievances);
router.get('/:id', authMiddleware, grievanceController.getGrievance);

module.exports = router;

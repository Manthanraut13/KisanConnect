const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authMiddleware, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/grievances', adminController.getGrievances);
router.put('/grievances/:id', adminController.updateGrievance);
router.get('/reports/orders', adminController.getOrdersReport);
router.get('/reports/farmers', adminController.getTopFarmers);
router.post('/notifications/broadcast', adminController.broadcastNotification);

module.exports = router;

const router = require('express').Router();
const logisticsController = require('../controllers/logistics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');

router.post('/assign/:orderId', authMiddleware, requireRole('admin'), logisticsController.assignDriver);
router.get('/driver/dashboard', authMiddleware, requireRole('logistics'), logisticsController.getDriverDashboard);
router.get('/driver/available-orders', authMiddleware, requireRole('logistics'), logisticsController.getAvailableOrders);
router.post('/driver/accept/:orderId', authMiddleware, requireRole('logistics'), logisticsController.acceptOrder);
router.get('/driver/assignments', authMiddleware, requireRole('logistics'), logisticsController.getDriverAssignments);
router.put('/delivery/:id/start', authMiddleware, requireRole('logistics'), logisticsController.startDelivery);
router.put('/driver/status', authMiddleware, requireRole('logistics'), logisticsController.updateStatus);
router.put(
  '/delivery/:id/confirm',
  authMiddleware,
  requireRole('logistics'),
  upload.single('proof'),
  logisticsController.confirmDelivery
);
router.get('/track/:orderId', logisticsController.trackOrder); // Public tracking


module.exports = router;
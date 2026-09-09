const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All order routes require login
router.use(authMiddleware);

router.post('/', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);
router.put('/:id/status', requireRole('farmer', 'admin', 'logistics'), orderController.updateOrderStatus);

module.exports = router;
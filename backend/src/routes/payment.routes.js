const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, paymentController.verify);
router.post('/webhook', paymentController.webhook); // NO auth — Razorpay signature verify karta hai
router.get('/history', authMiddleware, paymentController.getHistory);

module.exports = router;
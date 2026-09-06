const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All cart routes require login
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.post('/add', cartController.addToCart);
router.put('/items/:listingId', cartController.updateCartItem);
router.delete('/items/:listingId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
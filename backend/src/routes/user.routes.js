const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.post('/me/profile-image', authMiddleware, upload.single('image'), userController.uploadProfileImage);
router.post('/me/complete-profile', authMiddleware, userController.completeProfile);

module.exports = router;

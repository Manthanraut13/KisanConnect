const router = require('express').Router();
const listingController = require('../controllers/listing.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createListingSchema, updateListingSchema } = require('../middleware/validators/listing.validator');
const { upload } = require('../middleware/upload.middleware');

// Public routes
router.get('/', listingController.getListings);
router.get('/search', listingController.searchListings);
router.get('/farmer/mine', authMiddleware, requireRole('farmer', 'fpo_admin'), listingController.getFarmerListings);
router.get('/:id', listingController.getListingById);

// Farmer-only routes
router.post(
  '/',
  authMiddleware,
  requireRole('farmer', 'fpo_admin'),
  upload.array('images', 5),
  validate(createListingSchema),
  listingController.createListing
);
router.put('/:id', authMiddleware, requireRole('farmer', 'fpo_admin'), validate(updateListingSchema), listingController.updateListing);
router.delete('/:id', authMiddleware, requireRole('farmer', 'fpo_admin'), listingController.deleteListing);

module.exports = router;
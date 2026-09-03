const router = require('express').Router();
const webhookController = require('../controllers/webhook.controller');

router.post('/refresh-forecasts', webhookController.refreshForecasts);
router.post('/order-placed', webhookController.orderPlaced);
router.post('/new-grievance', webhookController.newGrievance);
router.post('/log', webhookController.logWebhook);

module.exports = router;

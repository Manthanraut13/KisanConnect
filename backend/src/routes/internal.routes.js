const router = require('express').Router();
const { DemandForecast } = require('../models');

// Middleware: verify internal secret (only trusted internal services can call this)
const internalAuthMiddleware = (req, res, next) => {
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized internal call' });
  }
  next();
};

router.post('/forecasts/upsert', internalAuthMiddleware, async (req, res, next) => {
  try {
    const { crop_name, district, state, forecast, model_version } = req.body;

    if (!crop_name || !Array.isArray(forecast)) {
      return res.status(400).json({ success: false, message: 'crop_name and forecast array are required' });
    }

    let upserted = 0;
    for (const f of forecast) {
      await DemandForecast.upsert({
        crop_name,
        district,
        state,
        forecast_date: f.date,
        predicted_price: f.predicted_price,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        demand_index: f.demand_index,
        confidence_score: f.confidence,
        model_version,
      });
      upserted++;
    }

    return res.json({ success: true, upserted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
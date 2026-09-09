const express = require('express');
const axios = require('axios');
const router = express.Router();
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.use(async (req, res) => {
  try {
    const targetUrl = `${AI_SERVICE_URL}/ai${req.path}`;
    
    // Copy headers and omit host header to avoid proxy loop / host mismatch
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];
    headers['x-internal-secret'] = process.env.INTERNAL_SECRET || 'kisan_connect_internal_2026';

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: headers,
      params: req.query,
      timeout: 20000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`AI Proxy Error [${req.method} ${req.path}]: ${error.message}`);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({
      success: false,
      message: 'AI Microservice proxy connection failed',
      error: error.message
    });
  }
});

module.exports = router;

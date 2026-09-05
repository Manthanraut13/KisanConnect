const { WorkflowLog, DemandForecast, Grievance } = require('../models');
const { sendSMS, sendEmail } = require('../services/notification.service');
const axios = require('axios');
const logger = require('../utils/logger');

const verifySecret = (req) => {
  const secret = req.headers['x-webhook-secret'];
  return secret && secret === process.env.WEBHOOK_SECRET;
};

const refreshForecasts = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (!verifySecret(req)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const aiUrl = process.env.AI_SERVICE_URL;
    if (!aiUrl) throw new Error('AI_SERVICE_URL not configured');

    const response = await axios.post(`${aiUrl}/ai/forecast/batch`, {}, {
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    });

    await WorkflowLog.create({
      workflow_name: 'refresh-forecasts',
      trigger_type: 'cron',
      status: 'success',
      execution_time_ms: Date.now() - startTime,
      payload: { result: response.data },
    });

    return res.json({ success: true, message: 'Forecasts refreshed', data: response.data });
  } catch (error) {
    await WorkflowLog.create({
      workflow_name: 'refresh-forecasts',
      trigger_type: 'cron',
      status: 'failed',
      execution_time_ms: Date.now() - startTime,
      error_message: error.message,
    }).catch((e) => logger.error('Failed to log workflow', e));

    logger.error('Forecast refresh failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const orderPlaced = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (!verifySecret(req)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const { order_id, farmer_mobile, consumer_mobile, farmer_name, crop, quantity, amount } = req.body;

    if (!farmer_mobile || !consumer_mobile) {
      throw new Error('Missing recipient mobile numbers');
    }

    const farmerMsg = `New order! ${crop} ${quantity}kg for ₹${amount}. Prepare by today.`;
    await sendSMS(farmer_mobile, farmerMsg);
    const consumerMsg = `Order confirmed! ${crop} from ${farmer_name}. Track: ${process.env.APP_URL}/orders/${order_id}`;
    await sendSMS(consumer_mobile, consumerMsg);

    await WorkflowLog.create({
      workflow_name: 'order-notification',
      trigger_type: 'webhook',
      status: 'success',
      execution_time_ms: Date.now() - startTime,
      payload: { order_id },
    });

    return res.json({ success: true, message: 'Order notifications sent' });
  } catch (error) {
    await WorkflowLog.create({
      workflow_name: 'order-notification',
      trigger_type: 'webhook',
      status: 'failed',
      execution_time_ms: Date.now() - startTime,
      error_message: error.message,
    }).catch((e) => logger.error('Failed to log workflow', e));

    return res.status(500).json({ success: false, message: error.message });
  }
};

const newGrievance = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (!verifySecret(req)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const { grievance_id, description } = req.body;
    if (!grievance_id || !description) {
      throw new Error('grievance_id and description are required');
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) throw new Error('GROQ_API_KEY not configured');

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'Classify the grievance. Return JSON only: {"category": "payment|logistics|quality|fraud|other", "severity": "low|medium|high|critical", "suggested_resolution": "string"}',
          },
          { role: 'user', content: description },
        ],
        temperature: 0.3,
      },
      { headers: { Authorization: `Bearer ${groqKey}` } }
    );

    let classification;
    try {
      classification = JSON.parse(groqResponse.data.choices[0].message.content);
    } catch (e) {
      classification = { category: 'other', severity: 'medium', suggested_resolution: '' };
    }

    const severity = classification.severity || 'medium';
    const slaHours = { critical: 4, high: 24, medium: 48, low: 72 }[severity];
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000);

    await Grievance.update(
      {
        category: classification.category || 'other',
        severity,
        sla_deadline: slaDeadline,
      },
      { where: { id: grievance_id } }
    );

    await WorkflowLog.create({
      workflow_name: 'grievance-triage',
      trigger_type: 'webhook',
      status: 'success',
      execution_time_ms: Date.now() - startTime,
      payload: { grievance_id, classification },
    });

    return res.json({
      success: true,
      message: 'Grievance triaged',
      data: { grievance_id, classification, sla_deadline: slaDeadline },
    });
  } catch (error) {
    await WorkflowLog.create({
      workflow_name: 'grievance-triage',
      trigger_type: 'webhook',
      status: 'failed',
      execution_time_ms: Date.now() - startTime,
      error_message: error.message,
    }).catch((e) => logger.error('Failed to log workflow', e));

    return res.status(500).json({ success: false, message: error.message });
  }
};

const logWebhook = async (req, res, next) => {
  try {
    if (!verifySecret(req)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }
    await WorkflowLog.create({ ...req.body });
    return res.json({ success: true, message: 'Workflow logged' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { refreshForecasts, orderPlaced, newGrievance, logWebhook };

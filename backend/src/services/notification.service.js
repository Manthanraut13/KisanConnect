const nodemailer = require('nodemailer');
const axios = require('axios');
const { NotificationLog } = require('../models');
const logger = require('../utils/logger');

let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const logNotification = async (userId, channel, recipient, subject, body, status, errorMessage) => {
  try {
    await NotificationLog.create({
      user_id: userId,
      channel,
      recipient,
      subject,
      body,
      status,
      error_message: errorMessage,
    });
  } catch (err) {
    logger.error(`Failed to log notification: ${err.message}`);
  }
};

const sendSMS = async (mobile, message, userId = null) => {
  try {
    if (!process.env.MSG91_AUTH_KEY) {
      logger.warn('MSG91_AUTH_KEY not set, SMS skipped');
      await logNotification(userId, 'sms', mobile, null, message, 'failed', 'MSG91 key missing');
      return { success: false, reason: 'SMS config missing' };
    }

    const response = await axios.post(
      'https://api.msg91.com/api/v5/flow/',
      {
        sender: process.env.MSG91_SENDER_ID || 'KISNCT',
        route: '4',
        mobiles: `91${mobile}`,
        message,
      },
      { headers: { authkey: process.env.MSG91_AUTH_KEY } }
    );

    const success = response.data?.type === 'success';
    await logNotification(userId, 'sms', mobile, null, message, success ? 'sent' : 'failed', success ? null : 'SMS send failed');
    return { success };
  } catch (err) {
    logger.error(`SMS send failed: ${err.message}`);
    await logNotification(userId, 'sms', mobile, null, message, 'failed', err.message);
    return { success: false, reason: err.message };
  }
};

const sendEmail = async (to, subject, htmlBody, userId = null) => {
  try {
    if (!transporter) {
      logger.warn('Email transporter not configured, email skipped');
      await logNotification(userId, 'email', to, subject, htmlBody, 'failed', 'Email config missing');
      return { success: false, reason: 'Email config missing' };
    }

    await transporter.sendMail({
      from: `"Kisan Connect" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });

    await logNotification(userId, 'email', to, subject, htmlBody, 'sent');
    return { success: true };
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    await logNotification(userId, 'email', to, subject, htmlBody, 'failed', err.message);
    return { success: false, reason: err.message };
  }
};

const sendPush = async (fcmToken, title, body, data = {}, userId = null) => {
  try {
    if (!fcmToken) {
      logger.warn('FCM token missing, push skipped');
      return { success: false, reason: 'No FCM token' };
    }

    const { admin } = require('../config/firebase.config');
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
    });

    await logNotification(userId, 'push', fcmToken, title, body, 'sent');
    return { success: true, messageId: response };
  } catch (err) {
    logger.error(`Push send failed: ${err.message}`);
    await logNotification(userId, 'push', fcmToken, title, body, 'failed', err.message);
    return { success: false, reason: err.message };
  }
};

const sendOrderNotification = async (order, farmer, consumer) => {
  const farmerMessage = `New order! ${order.crop_name} ${order.quantity_kg}kg for ₹${order.total_amount}. Prepare by ${order.delivery_slot || 'today'}.`;
  const consumerMessage = `Order confirmed! ${order.crop_name} from ${farmer.full_name}. Track: ${process.env.APP_URL}/orders/${order.id}`;

  await sendSMS(farmer.mobile, farmerMessage, farmer.id);
  await sendSMS(consumer.mobile, consumerMessage, consumer.id);

  if (consumer.fcm_token) {
    await sendPush(consumer.fcm_token, 'Order Confirmed', consumerMessage, { order_id: order.id }, consumer.id);
  }
};

const sendGrievanceAcknowledgement = async (grievance, user) => {
  const message = `Grievance #${grievance.id.slice(0, 8)} received. We will resolve it by ${grievance.sla_deadline || '48 hours'}.`;
  await sendSMS(user.mobile, message, user.id);

  if (user.email) {
    await sendEmail(
      user.email,
      'Grievance Received — Kisan Connect',
      `<p>Dear ${user.full_name},</p><p>${message}</p>`,
      user.id
    );
  }
};

module.exports = { sendSMS, sendEmail, sendPush, sendOrderNotification, sendGrievanceAcknowledgement };

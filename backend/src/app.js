const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { globalLimiter, authLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Kisan Connect API is running', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[dev] ${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/grievances', require('./routes/grievance.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/listings', require('./routes/listing.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use(errorHandler);

module.exports = app;

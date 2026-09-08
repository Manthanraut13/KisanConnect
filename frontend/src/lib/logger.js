const isDev = import.meta.env.DEV;
const LOG_PREFIX = '[KisanConnect]';

const formatArgs = (level, context, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `${LOG_PREFIX} [${level}] ${timestamp} ${context ? `[${context}]` : ''}`;
  return [prefix, ...args];
};

export const logger = {
  debug: (context, ...args) => isDev && console.debug(...formatArgs('DEBUG', context, ...args)),
  info: (context, ...args) => console.info(...formatArgs('INFO', context, ...args)),
  warn: (context, ...args) => console.warn(...formatArgs('WARN', context, ...args)),
  error: (context, ...args) => console.error(...formatArgs('ERROR', context, ...args)),
  log: (context, ...args) => console.log(...formatArgs('LOG', context, ...args)),

  api: {
    request: (method, url, data) => logger.info('API', `→ ${method} ${url}`, data ?? ''),
    response: (method, url, status, data) => logger.info('API', `← ${method} ${url} [${status}]`, data ?? ''),
    error: (method, url, error) => logger.error('API', `✗ ${method} ${url}`, error),
  },

  auth: {
    login: (user) => logger.info('AUTH', 'User logged in', { id: user?.id, role: user?.role, name: user?.full_name }),
    logout: () => logger.info('AUTH', 'User logged out'),
    tokenRefresh: () => logger.info('AUTH', 'Token refreshed'),
    error: (action, error) => logger.error('AUTH', `Failed to ${action}`, error),
  },

  cart: {
    add: (item) => logger.info('CART', 'Item added', { id: item?.listing_id, name: item?.crop_name, qty: item?.quantity_kg }),
    remove: (listingId) => logger.info('CART', 'Item removed', { listingId }),
    update: (listingId, qty) => logger.info('CART', 'Quantity updated', { listingId, qty }),
    clear: () => logger.info('CART', 'Cart cleared'),
    load: (count) => logger.info('CART', 'Cart loaded', { itemCount: count }),
    error: (action, error) => logger.error('CART', `Failed to ${action}`, error),
  },

  navigation: (from, to) => logger.info('NAV', `${from} → ${to}`),

  form: {
    submit: (formName, data) => logger.info('FORM', `${formName} submitted`, data),
    error: (formName, error) => logger.error('FORM', `${formName} error`, error),
  },

  payment: {
    start: (orderId, amount) => logger.info('PAYMENT', 'Payment started', { orderId, amount }),
    success: (orderId, paymentId) => logger.info('PAYMENT', 'Payment succeeded', { orderId, paymentId }),
    failed: (orderId, error) => logger.error('PAYMENT', 'Payment failed', { orderId, error }),
  },
};

export default logger;
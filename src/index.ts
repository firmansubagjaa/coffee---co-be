import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { env } from './config/env';
import { apiResponse } from './utils/response';
import { HTTPException } from 'hono/http-exception';

export const app = new OpenAPIHono();

// --- Global Middlewares ---
app.use('*', logger());
app.use('*', cors({
  origin: env.FRONTEND_URL,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

// --- Global Error Handler ---
app.onError((err, c) => {
  console.error(err);
  if (err instanceof HTTPException) {
    return apiResponse(c, err.status as any, err.message);
  }
  return apiResponse(c, 500, "Internal Server Error", process.env.NODE_ENV === 'development' ? String(err) : undefined);
});

// --- Test Route ---
app.get('/', (c) => {
  return apiResponse(c, 200, "☕ Coffee & Co. Backend is Running!", {
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// --- Routes ---
import auth from './modules/auth/auth.controller';
import products from './modules/products/products.controller';
import orders from './modules/orders/orders.controller';
import users from './modules/users/users.controller';
import admin from './modules/admin/admin.controller';
import analytics from './modules/analytics/analytics.controller';
import logistics from './modules/logistics/logistics.controller';
import rewards from './modules/rewards/rewards.controller';
import storage from './modules/storage/storage.controller';
import cms from './modules/cms/cms.controller';
import payment from './modules/payment/payment.controller';
import realtime from './modules/realtime/realtime.controller';
import inventory from './modules/inventory/inventory.controller';
import social from './modules/social/social.controller';
import finance from './modules/finance/finance.controller';
import health from './modules/health/health.controller';

app.route('/auth', auth);
app.route('/products', products);
app.route('/orders', orders);
app.route('/users', users);
app.route('/admin', admin);
app.route('/analytics', analytics);
app.route('/logistics', logistics);
app.route('/rewards', rewards);
app.route('/storage', storage);
app.route('/cms', cms);
app.route('/payment', payment);
app.route('/sse', realtime);
app.route('/inventory', inventory);
app.route('/social', social);
app.route('/finance', finance);
app.route('/', health); // Health check at /

// --- Documentation ---
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Coffee & Co. API',
    description: 'Production-ready API for Coffee & Co.',
  },
});

app.get('/ui', swaggerUI({ url: '/doc' }));

// --- Start Server ---
export default {
  port: env.PORT,
  fetch: app.fetch,
};

import AppController from '../controllers/AppController';

const express = require('express');
// all endpoints of our API
const router = (app) => {
  const route = express.Router();
  app.use(express.json());
  app.use('/', route);

  route.get('/status', (request, response) => AppController.getStatus(request, response));
  route.get('/stats', (request, response) => AppController.getStats(request, response));
};

export default router;

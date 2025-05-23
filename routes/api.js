const express = require('express');
const got = require('got');
const skService = require('../services/sk');
const pingOneService = require('../services/pingOne');
const router = express.Router();

// Retrieve the token needed to invoke a Widget flow
router.get('/getSkToken', async (req, res, next) => {
  try {
    const data = await skService.getSdkToken();
    res.send({ skToken: data.access_token });
  } catch (err) {
    next(err);
  }
});

// P1 client CORS proxy for flows
router.all('/pingauth/flows/:flowId', async (req, res, next) => {
  try {
    const url = `https://auth.pingone.com/flows${req.params.flowId}`;
    const response = await got(url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body)
    }).json();
    res.send(response);
  } catch (err) {
    next(err);
  }
});

// PingOne Risk - Evaluation request
router.post('/getRiskDecision', async (req, res, next) => {
  try {
    const sdkPayload = req.headers.sdkpayload;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const result = await pingOneService.evaluateRisk({ sdkPayload, ip });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
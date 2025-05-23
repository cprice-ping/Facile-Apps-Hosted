const express = require('express');
const pfAdapter = require('../services/pfAdapter');
const router = express.Router();

router.post('/getDeviceId/:releaseName', async (req, res, next) => {
  try {
    const { REF, resumePath } = req.body;
    const data = await pfAdapter.agentlessPickup(req.params.releaseName, REF);
    const params = {
      pfResumePath: `https://${req.params.releaseName}.ping-devops.com${resumePath}`,
      releaseName: req.params.releaseName,
      data
    };
    res.render('zerotrust/opswat.pug', params);
  } catch (err) {
    next(err);
  }
});

router.post('/dropoff/:releaseName', async (req, res, next) => {
  try {
    const ref = await pfAdapter.agentlessDropoff(req.params.releaseName, req.body);
    res.send({ dropoffRef: ref });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
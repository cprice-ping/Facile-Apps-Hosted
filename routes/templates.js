const express = require('express');
const router = express.Router();

// Render Pug templates for various demos
router.get('/consent-mgmt', (req, res) => {
  res.render('consent-mgmt/index.pug');
});
router.get('/utile', (req, res) => {
  res.render('utile/index.pug');
});
router.get('/spa', (req, res) => {
  res.render('spa/index.pug');
});
router.get('/:releaseName/widget', (req, res) => {
  const pfBaseUrl = `https://${req.params.releaseName}.ping-devops.com`;
  res.render('widget/index.pug', { pfBaseUrl });
});
router.get('/:releaseName/redirectless', (req, res) => {
  const pfBaseUrl = `https://${req.params.releaseName}.ping-devops.com`;
  res.render('widget/redirectless.pug', { pfBaseUrl });
});
router.get('/:releaseName/redirectless2', (req, res) => {
  res.render('widget/redirectless2.pug', { releaseName: req.params.releaseName });
});
router.post('/pingidtest', (req, res) => {
  res.redirect('/pingidtest');
});

module.exports = router;
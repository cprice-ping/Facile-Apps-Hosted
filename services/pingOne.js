const got = require('got');
const config = require('../config');

async function getToken() {
  const url = `https://auth.pingone.com/${config.riskEnvId}/as/token`;
  const basicAuth = Buffer.from(
    `${config.riskClientId}:${config.riskClientSecret}`
  ).toString('base64');
  const data = await got.post(url, {
    headers: { Authorization: `Basic ${basicAuth}` },
    form: { grant_type: 'client_credentials' }
  }).json();
  return data.access_token;
}

async function evaluateRisk({ sdkPayload, ip }) {
  const token = await getToken();
  const url = `https://api.pingone.com/v1/environments/${config.riskEnvId}/riskEvaluations`;
  const body = {
    event: {
      targetResource: { id: 'Signals SDK demo', name: 'Signals SDK demo' },
      ip,
      flow: { type: 'AUTHENTICATION' },
      user: { id: 'facile-user', name: 'facile-user', type: 'EXTERNAL' },
      sdk: { signals: { data: sdkPayload } },
      sharingType: 'PRIVATE',
      origin: 'FACILE_DEMO'
    },
    riskPolicySet: { id: '51f11de3-d6cb-0c8b-0b49-0e7e44ad6cf9' }
  };
  const result = await got.post(url, { headers: { Authorization: `Bearer ${token}` }, json: body }).json();
  return result;
}

module.exports = {
  getToken,
  evaluateRisk
};
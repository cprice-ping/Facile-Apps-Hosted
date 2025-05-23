const got = require('got');
const config = require('../config');

async function agentlessPickup(releaseName, REF) {
  const url = `https://${releaseName}.ping-devops.com/ext/ref/pickup?REF=${REF}`;
  const auth = Buffer.from(
    `${config.pfAdapterUser}:${config.pfAdapterPwd}`
  ).toString('base64');
  const data = await got(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      'ping-instanceId': 'FacileReferenceID'
    }
  }).json();
  return data;
}

async function agentlessDropoff(releaseName, dropoffData) {
  const url = `https://${releaseName}.ping-devops.com/ext/ref/dropoff`;
  const auth = Buffer.from(
    `${config.pfAdapterUser}:${config.pfAdapterPwd}`
  ).toString('base64');
  const data = await got.post(url, {
    headers: { Authorization: `Basic ${auth}` },
    json: { dropoffData }
  }).json();
  return data.REF;
}

module.exports = {
  agentlessPickup,
  agentlessDropoff
};
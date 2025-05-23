const got = require('got');
const config = require('../config');

async function getSdkToken() {
  const url = `https://devapi.singularkey.com/v1/company/${config.skCompanyId}/sdkToken`;
  const data = await got(url, { headers: { 'X-SK-API-KEY': config.skApiKey } }).json();
  return data;
}

module.exports = {
  getSdkToken
};
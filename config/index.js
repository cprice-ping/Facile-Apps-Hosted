const Joi = require('joi');
const dotenv = require('dotenv');

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(3000),
  SK_COMPANY_ID: Joi.string().required(),
  SK_API_KEY: Joi.string().required(),
  RISK_ENV_ID: Joi.string().required(),
  RISK_CLIENT_ID: Joi.string().required(),
  RISK_CLIENT_SECRET: Joi.string().required(),
  PF_ADAPTER_USER: Joi.string().required(),
  PF_ADAPTER_PWD: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('*')
}).unknown()
  .required();

const { error, value: env } = schema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  port: env.PORT,
  skCompanyId: env.SK_COMPANY_ID,
  skApiKey: env.SK_API_KEY,
  riskEnvId: env.RISK_ENV_ID,
  riskClientId: env.RISK_CLIENT_ID,
  riskClientSecret: env.RISK_CLIENT_SECRET,
  pfAdapterUser: env.PF_ADAPTER_USER,
  pfAdapterPwd: env.PF_ADAPTER_PWD,
  corsOrigin: env.CORS_ORIGIN
};
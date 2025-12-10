import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  ADMIN_NAME: Joi.string().required(),
  EMAIL_HOST: Joi.string(),
  EMAIL_PORT: Joi.number(),
  EMAIL_USER: Joi.string(),
  EMAIL_PASS: Joi.string(),
  FINE_PER_DAY: Joi.number().default(5),
  MAX_BORROW_DAYS: Joi.number().default(14),
  MAX_BOOKS_PER_USER: Joi.number().default(5)
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  admin: {
    email: envVars.ADMIN_EMAIL,
    password: envVars.ADMIN_PASSWORD,
    name: envVars.ADMIN_NAME,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
  },
  library: {
    finePerDay: envVars.FINE_PER_DAY,
    maxBorrowDays: envVars.MAX_BORROW_DAYS,
    maxBooksPerUser: envVars.MAX_BOOKS_PER_USER,
  },
};

export default config;
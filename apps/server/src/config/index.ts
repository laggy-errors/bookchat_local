import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.SERVER_PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'bookchat-super-secret-fountain-pen-key',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: configCorsOrigin(),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

function configCorsOrigin() {
  return process.env.CORS_ORIGIN || '*';
}


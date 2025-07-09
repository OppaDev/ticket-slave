require('dotenv').config();

const config={
  env: process.env.NODE_ENV || 'Development',
  port: process.env.PORT || 3000,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET,

  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpSecure: process.env.SMTP_SECURE === 'true',

  smtp_email: process.env.SMTP_EMAIL,
  smtp_password: process.env.SMTP_PASSWORD,

  urlResetPasswordFront: process.env.URL_RESET_PASSWORD_FRONT,

  isProd: process.env.NODE_ENV === 'production',
  dbUrl: process.env.DATABASE_URL,
}

module.exports = { config };

import 'dotenv/config';

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,

  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  bookingNotifyEmail: process.env.BOOKING_NOTIFY_EMAIL || 'reviews.shinex@gmail.com',
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || 'reviews.shinex@gmail.com',
};

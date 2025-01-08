import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Using Gmail App Password
  },
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
}));
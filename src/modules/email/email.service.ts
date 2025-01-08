import { Injectable } from '@nestjs/common';
import * as nodeMailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodeMailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get<string>('EMAIL_USER'),
        pass: configService.get<string>('EMAIL_APP_PASSWORD'),
      },
    });
  }

  generateOtp() : string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, otp: string) : Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'OTP Verification',
      html: `Your OTP is ${otp}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error sending OTP email: ${error}`);
    }
  }
}
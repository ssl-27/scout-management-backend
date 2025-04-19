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
      html: `hi, welcome to SCOUT MANAGEMENT INFORMATION SYSTEM. 
            <p> This is the DEVELOP Environment</p>. 
            Your OTP is ${otp}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error sending OTP email: ${error}`);
    }
  }

  async sendEmail(email: string, title: string, content:string) : Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: title,
      html: `<h1>Notice from SMIS</h1><p>${content}</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error sending verification email: ${error}`);
    }
  }
}
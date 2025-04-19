// src/notifications/notifications.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Check if any Firebase app exists already
      admin.app();
      console.log('Firebase Admin already initialized');
    } catch (error) {
      // Initialize Firebase Admin only if it doesn't exist
      const serviceAccount = JSON.parse(
        Buffer.from(
          this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY'),
          'base64',
        ).toString(),
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully');
    }
  }
// In your notifications.service.ts
  async sendNotification(tokens: string[], title: string, body: string, data: any = {}) {
    try {
      const stringifiedData = {};
      Object.keys(data).forEach(key => {
        stringifiedData[key] = String(data[key]); // Convert all values to strings
      });
      const responses = await Promise.all(

        tokens.map(token =>
          admin.messaging().send({
            notification: {
              title,
              body,
            },
            data: stringifiedData,
            token,
          })
            .catch(error => {
              console.error(`Error sending to token ${token}:`, error);
              return { error };
            })
        )
      );

      const successCount = responses.filter(r => typeof r === 'string' || !r.error).length;
      const failureCount = responses.filter(r => typeof r !== 'string' && r.error).length;
      const errors = responses.filter((r): r is { error: any } => typeof r !== 'string' && 'error' in r).map(r => r.error);
      console.log('Detailed notification errors:', errors);

      return {
        success: successCount,
        failure: failureCount,
        errors: errors,
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data: any = {},
  ) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        topic,
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending notification to topic:', error);
      throw error;
    }
  }
}
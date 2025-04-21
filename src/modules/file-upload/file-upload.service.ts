import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>('APP_URL') || 'https://scout-management-api-154434536011.asia-east1.run.app';
    return `${baseUrl}/uploads/${filename}`;
  }

  getFilePath(filename: string): string {
    return path.join(process.cwd(), 'uploads', filename);
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
    }
  }
}
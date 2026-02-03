import { Injectable, Logger, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getConfig } from '@app/common';
import { AWS_S3_CLIENT } from '../providers/aws-s3-client.provider';

@Injectable()
export class S3UploadService {
  private readonly logger = new Logger(S3UploadService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(AWS_S3_CLIENT)
    private readonly s3Client: S3Client,
  ) {
    this.bucketName = getConfig('aws.s3.trainingBucket') || 'crypto-news-datalake-training';
  }

  /**
   * Upload CSV content to S3
   */
  async uploadCSV(
    fileName: string,
    csvContent: string,
    folder: string = 'training-data',
  ): Promise<string> {
    const key = `${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: csvContent,
        ContentType: 'text/csv',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          service: 'news-ai-service',
        },
      });

      await this.s3Client.send(command);

      const s3Uri = `s3://${this.bucketName}/${key}`;
      this.logger.log(`✅ Uploaded training data to ${s3Uri}`);

      return s3Uri;
    } catch (error) {
      this.logger.error(`❌ Failed to upload to S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload JSON content to S3
   */
  async uploadJSON(
    fileName: string,
    jsonData: any,
    folder: string = 'training-data',
  ): Promise<string> {
    const key = `${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(jsonData, null, 2),
        ContentType: 'application/json',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          service: 'news-ai-service',
        },
      });

      await this.s3Client.send(command);

      const s3Uri = `s3://${this.bucketName}/${key}`;
      this.logger.log(`✅ Uploaded training data to ${s3Uri}`);

      return s3Uri;
    } catch (error) {
      this.logger.error(`❌ Failed to upload to S3: ${error.message}`, error.stack);
      throw error;
    }
  }
}

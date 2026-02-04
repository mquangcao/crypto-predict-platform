import { Provider } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '@app/common';

export const AWS_S3_CLIENT = 'AWS_S3_CLIENT';

export const AwsS3ClientProvider: Provider = {
  provide: AWS_S3_CLIENT,
  inject: [],
  useFactory: () => {
    const region = getConfig('aws.region');
    const accessKeyId = getConfig('aws.accessKeyId');
    const secretAccessKey = getConfig('aws.secretAccessKey');

    return new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
    });
  },
};

import { Provider } from '@nestjs/common';
import { getConfig } from '@app/common';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import { SQSClient } from '@aws-sdk/client-sqs';

export const AWS_SCHEDULER_CLIENT = 'AWS_SCHEDULER_CLIENT';
export const AWS_SQS_CLIENT = 'AWS_SQS_CLIENT';

export const AwsSchedulerClientProvider: Provider = {
  provide: AWS_SCHEDULER_CLIENT,
  useFactory: () => {
    const region = getConfig('aws.region');
    const accessKeyId = getConfig('aws.accessKeyId');
    const secretAccessKey = getConfig('aws.secretAccessKey');

    return new SchedulerClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
};

export const AwsSqsClientProvider: Provider = {
  provide: AWS_SQS_CLIENT,
  useFactory: () => {
    const region = getConfig('aws.region');
    const accessKeyId = getConfig('aws.accessKeyId');
    const secretAccessKey = getConfig('aws.secretAccessKey');

    return new SQSClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
};

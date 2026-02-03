import { Provider } from '@nestjs/common';
import { SageMakerRuntimeClient } from '@aws-sdk/client-sagemaker-runtime';
import { getConfig } from '@app/common';

export const AWS_SAGEMAKER_CLIENT = 'AWS_SAGEMAKER_CLIENT';

export const AwsSageMakerClientProvider: Provider = {
  provide: AWS_SAGEMAKER_CLIENT,
  useFactory: () => {
    return new SageMakerRuntimeClient({
      region: getConfig('aws.region'),
      credentials: {
        accessKeyId: getConfig('aws.accessKeyId'),
        secretAccessKey: getConfig('aws.secretAccessKey'),
      },
    });
  },
};

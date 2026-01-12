require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });

module.exports = {
  port: number('PORT'),
  appName: 'APP_NAME',
  database: {
    type: 'DATABASE_TYPE',
    host: 'DATABASE_HOST',
    port: number('DATABASE_PORT'),
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    dbName: 'DATABASE_DB_NAME',
    synchronize: boolean('DATABASE_SYNCHRONIZE'),
  },
  aws: {
    region: 'AWS_REGION',
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    sqs: {
      sentimentQueueUrl: 'SQS_SENTIMENT_QUEUE_URL',
      maxMessages: number('SQS_MAX_MESSAGES'),
      waitTimeSeconds: number('SQS_WAIT_TIME_SECONDS'),
      visibilityTimeout: number('SQS_VISIBILITY_TIMEOUT'),
    },
  },
  sentiment: {
    model: 'SENTIMENT_MODEL',
  },
};

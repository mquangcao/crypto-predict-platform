require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });
const json = name => ({ __name: name, __format: 'json' });

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
  news: {
    sources: {
      cryptocompare: {
        apiKey: 'CRYPTOCOMPARE_API_KEY',
      },
    },
    ai: {
      groqApiKey: 'GROQ_API_KEY',
    },
  },
  aws: {
    region: 'AWS_REGION',
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    sqs: {
      impactQueueArn: 'SQS_IMPACT_QUEUE_ARN',
      sentimentQueueUrl: 'SQS_SENTIMENT_QUEUE_URL',
    },
    eventBridge: {
      roleArn: 'EVENTBRIDGE_ROLE_ARN',
    },
  },
};
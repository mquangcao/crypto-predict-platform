module.exports = {
  port: 4004,
  appName: 'news-ai-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5435,
    username: 'postgres',
    password: 'postgres',
    dbName: 'news_db', // Cùng DB với news-service
    synchronize: true,
    logging: false,
  },
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sqs: {
      sentimentQueueUrl: process.env.SQS_SENTIMENT_QUEUE_URL || '',
      maxMessages: 10,
      waitTimeSeconds: 20,
      visibilityTimeout: 30,
    },
  },
  sentiment: {
    model: 'vader', // vader, bert, gpt
    enabled: true,
  },
};

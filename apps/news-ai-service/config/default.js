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
    region: 'ap-southeast-2',
    accessKeyId: '',
    secretAccessKey: '',
    sqs: {
      sentimentQueueUrl: '',
      impactQueueUrl: '',
      maxMessages: 10,
      waitTimeSeconds: 20,
      visibilityTimeout: 30,
    },
    s3: {
      trainingBucket: 'crypto-news-datalake-training',
    },
    sagemaker: {
      endpointName: 'crypto-price-predictor-v1',
    },
  },
  training: {
    uploadEnabled: false,
  },
  sentiment: {
    model: 'vader', // vader, bert, gpt
    enabled: true,
  },
  core: {
    gateway: {
      services: {
        market: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8004,
          },
        },
      },
    },
  },
};

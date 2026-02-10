module.exports = {
  port: 4003,
  appName: 'news-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5435,
    username: 'postgres',
    password: 'postgres',
    dbName: 'news_db',
    synchronize: true,
    logging: false,
  },
  core: {
    gateway: {
      initServices: ['news'],
      services: {
        auth: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8001,
          },
        },
        user: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8002,
          },
        },
        news: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8003,
          },
        },
      },
    },
  },
  news: {
    crawl: {
      enabled: true,
      interval: '*/5 * * * *', // Every 5 minutes
    },
    sources: {
      cryptocompare: {
        enabled: true,
        apiKey: process.env.CRYPTOCOMPARE_API_KEY || '',
      },
    },
    ai: {
      groqApiKey: process.env.GROQ_API_KEY || '',
      model: 'llama-3.3-70b-versatile', // Fast and free Groq model for HTML parsing
    },
  },
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sqs: {
      impactQueueArn: process.env.SQS_IMPACT_QUEUE_ARN || '',
      sentimentQueueUrl: process.env.SQS_SENTIMENT_QUEUE_URL || '',
    },
    eventBridge: {
      roleArn: process.env.EVENTBRIDGE_ROLE_ARN || '',
    },
  },
};
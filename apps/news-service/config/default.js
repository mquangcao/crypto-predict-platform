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
  },
};
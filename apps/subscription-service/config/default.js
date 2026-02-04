module.exports = {
  port: 4007,
  appName: 'subscription-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5436,
    username: 'postgres',
    password: 'postgres',
    dbName: 'subscription_db',
    synchronize: true,
    logging: false,
  },
  
  core: {
    kafka: {
      client: {
        clientId: 'subscription-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'subscription-service-group',
      },
    },
    gateway: {
      initServices: ['subscription'],
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
        payment: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8005,
          },
        },
        plan: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8006,
          },
        },
        subscription: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8007,
          },
        },
      },
    },
  },
};

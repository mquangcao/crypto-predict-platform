module.exports = {
  port: 4009,
  appName: 'payment-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    dbName: 'postgres',
    synchronize: true,
    logging: false,
  },

  payment: {
    momo: {
      partnerCode: 'MOMO',
      accessKey: 'your-momo-access-key',
      secretKey: 'your-momo-secret-key',
      apiEndpoint: 'https://test-payment.momo.vn',
      ipnUrl: 'http://localhost:8000/api/payment/callback/momo',
      partnerName: 'Crypto Platform',
      storeId: 'CryptoPlatformStore',
    },
  },
  
  core: {
    kafka: {
      client: {
        clientId: 'payment-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'payment-service-group',
      },
    },
    gateway: {
      initServices: ['payment'],
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

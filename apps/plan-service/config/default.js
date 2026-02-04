module.exports = {
  port: 4006,
  appName: 'plan-service',
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
  
  core: {
    gateway: {
      initServices: ['plan'],
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
      },
    },
  },
};

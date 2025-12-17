module.exports = {
  port: 4001,
  appName: 'auth-service',
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
      initServices: ['auth'],
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
      },
    },
  },
};

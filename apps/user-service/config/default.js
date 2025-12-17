module.exports = {
  port: 4002,
  appName: 'user-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    dbName: 'postgres',
    synchronize: false,
    logging: false,
  },
  core: {
    gateway: {
      initServices: ['user'],
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

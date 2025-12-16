module.exports = {
  port: 4009,
  appName: 'auth-service',
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

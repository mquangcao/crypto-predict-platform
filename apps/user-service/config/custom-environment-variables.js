require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });

module.exports = {
  port: number('PORT'),
  appName: 'APP_NAME',
  database: {
    type: 'DATABASE_TYPE',
    host: 'DATABASE_HOST',
    port: number('DATABASE_PORT'),
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    dbName: 'DATABASE_DB_NAME',
    synchronize: boolean('DATABASE_SYNCHRONIZE'),
  },
  core: {
    gateway: {
      initServices: json('CORE_GATEWAY_INIT_SERVICES'),
      services: {
        auth: {
          transport: number('CORE_GATEWAY_SERVICES_AUTH_TRANSPORT'),
          options: {
            host: json('CORE_GATEWAY_SERVICES_AUTH_OPTIONS_HOST'),
            port: number('CORE_GATEWAY_SERVICES_AUTH_OPTIONS_PORT'),
          },
        },
        user: {
          transport: number('CORE_GATEWAY_SERVICES_USER_TRANSPORT'),
          options: {
            host: json('CORE_GATEWAY_SERVICES_USER_OPTIONS_HOST'),
            port: number('CORE_GATEWAY_SERVICES_USER_OPTIONS_PORT'),
          },
        },
      },
    },
  },
};

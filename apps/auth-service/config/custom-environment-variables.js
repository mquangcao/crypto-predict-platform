require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });
const json = name => ({ __name: name, __format: 'json' });

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
  
  auth: {
    token: {
      expiresIn: number('AUTH_TOKEN_EXPIRES_IN'),
      refreshExpiresIn: number('AUTH_TOKEN_REFRESH_EXPIRES_IN'),
      secret: 'AUTH_TOKEN_SECRET',
    },
    openid: {
      google: {
        clientId: 'AUTH_OPENID_GOOGLE_CLIENT_ID',
        clientSecret: 'AUTH_OPENID_GOOGLE_CLIENT_SECRET',
        callbackUrl: 'AUTH_OPENID_GOOGLE_CALLBACK_URL',
      },
    }
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

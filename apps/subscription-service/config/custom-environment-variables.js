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

  core: {
    kafka: {
      client: {
        brokers: json('CORE_KAFKA_CLIENT_BROKERS'),
        clientId: 'CORE_KAFKA_CLIENT_CLIENT_ID',
      },
      consumer: {
        groupId: 'CORE_KAFKA_CONSUMER_GROUP_ID',
      },
    },
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
        payment: {
          transport: number('CORE_GATEWAY_SERVICES_PAYMENT_TRANSPORT'),
          options: {
            host: json('CORE_GATEWAY_SERVICES_PAYMENT_OPTIONS_HOST'),
            port: number('CORE_GATEWAY_SERVICES_PAYMENT_OPTIONS_PORT'),
          },
        },
        plan: {
          transport: number('CORE_GATEWAY_SERVICES_PLAN_TRANSPORT'),
          options: {
            host: json('CORE_GATEWAY_SERVICES_PLAN_OPTIONS_HOST'),
            port: number('CORE_GATEWAY_SERVICES_PLAN_OPTIONS_PORT'),
          },
        },
        subscription: {
          transport: number('CORE_GATEWAY_SERVICES_SUBSCRIPTION_TRANSPORT'),
          options: {
            host: json('CORE_GATEWAY_SERVICES_SUBSCRIPTION_OPTIONS_HOST'),
            port: number('CORE_GATEWAY_SERVICES_SUBSCRIPTION_OPTIONS_PORT'),
          },
        },
      },
    },
  },
};

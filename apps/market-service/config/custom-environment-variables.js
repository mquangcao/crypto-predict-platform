require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });
const json = name => ({ __name: name, __format: 'json' });

module.exports = {
  port: number('PORT'),
  appName: 'APP_NAME',
  database: {
    host: 'DB_HOST',
    port: number('DB_PORT'),
    username: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    dbName: 'DB_NAME',
    synchronize: boolean('DB_SYNCHRONIZE'),
    logging: boolean('DB_LOGGING'),
  },
  market: {
    websocket: {
      cors: {
        origin: 'WS_CORS_ORIGIN',
      },
    },
  },
};

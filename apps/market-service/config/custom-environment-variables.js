require('dotenv').config();

const number = name => ({ __name: name, __format: 'number' });
const boolean = name => ({ __name: name, __format: 'boolean' });
const json = name => ({ __name: name, __format: 'json' });

module.exports = {
  port: number('PORT'),
  appName: 'APP_NAME',
  market: {
    websocket: {
      cors: {
        origin: 'WS_CORS_ORIGIN',
      },
    },
  },
};

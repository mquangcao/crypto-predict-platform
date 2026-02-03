module.exports = {
  port: 4005,
  appName: 'market-service',
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5436,
    username: 'postgres',
    password: 'postgres',
    dbName: 'market_db',
    synchronize: true,
    logging: false,
  },
  core: {
    gateway: {
      initServices: ['market'],
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
        news: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8003,
          },
        },
        market: {
          transport: 0,
          options: {
            host: 'localhost',
            port: 8004,
          },
        },
      },
    },
  },
  market: {
    binance: {
      wsUrl: 'wss://stream.binance.com:9443/stream',
      symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    },
    websocket: {
      cors: {
        origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
        credentials: false,
      },
    },
  },
};

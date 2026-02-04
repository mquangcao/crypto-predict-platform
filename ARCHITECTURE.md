# 🏗️ KIẾN TRÚC GIAO TIẾP HỆ THỐNG CRYPTO PLATFORM

## 📊 TỔNG QUAN ARCHITECTURE

```
Frontend (Next.js :3000)
    ↓ HTTP REST API
Kong API Gateway (:8000)
    ↓ HTTP Proxy
┌──────────────────────────────────────────────────────┐
│  Microservices Layer                                 │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │Auth Service │  │News Service │  │Market Service│ │
│  │  HTTP :4001 │  │  HTTP :4003 │  │  HTTP :4002  │ │
│  │  RPC  :8001 │  │  RPC  :8003 │  │  RPC  :8004  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘ │
│         │                │                 │         │
│         └────────────────┼─────────────────┘         │
│                    RPC Communication                 │
│                (NestJS Microservices TCP)            │
└──────────────────────────────────────────────────────┘
         │                 │                 │
         ↓                 ↓                 ↓
   ┌─────────┐       ┌─────────┐      (No Database)
   │Auth DB  │       │News DB  │
   │:5433    │       │:5435    │       WebSocket Stream
   └─────────┘       └─────────┘            ↓
                           │           Binance API
                           └──────────────┐
                                   │News AI│
                                   │Service│
                                   └───────┘
```

## 🔄 1. FRONTEND ↔ SERVICES (HTTP qua Kong)

### Kong API Gateway Routes:

| Endpoint       | Target Service  | Port |
| -------------- | --------------- | ---- |
| `/api/auth`    | auth-service    | 4001 |
| `/api/user`    | user-service    | 4002 |
| `/api/market`  | market-service  | 4002 |
| `/api/news`    | news-service    | 4003 |
| `/api/news-ai` | news-ai-service | 4004 |

### Luồng request:

```
Frontend → http://localhost:8000/api/market/candles?symbol=BTCUSDT
    ↓
Kong Gateway (CORS, Routing)
    ↓
market-service:4002/api/market/candles?symbol=BTCUSDT
    ↓
MarketController.getCandles()
    ↓
Response JSON
```

## 🔌 2. SERVICE ↔ SERVICE (RPC Inter-Communication)

### Pattern: CQRS + Gateway Module

Mỗi service có **2 ports**:

- **HTTP Port** (4001, 4002, ...) - External API cho frontend/Kong
- **RPC Port** (8001, 8002, ...) - Internal RPC cho inter-service communication

### Cấu trúc CQRS trong mỗi service:

```typescript
// 1. Định nghĩa Command
export class GetCandlesCommand implements ICommand {
  symbol: string;
  timeframe?: string;
  limit?: number;
}

// 2. Command Handler
@CommandHandler(GetCandlesCommand)
export class GetCandlesHandler {
  async execute(command: GetCandlesCommand) {
    return this.marketService.getCandles(...);
  }
}

// 3. Đăng ký vào OperationsMap
export const OperationsMap = {
  [MARKET_OPERATION.GET_CANDLES]: GetCandlesCommand,
};

// 4. Đăng ký trong Module
@Module({
  imports: [
    GatewayModule.forFeature(OperationsMap), // ✅ Quan trọng!
  ],
  providers: [...CommandHandlers],
})
```

### Cách service gọi service khác:

```typescript
// Service A gọi Service B
import { GatewayService } from '@app/core';
import { MARKET_OPERATION, SERVICE } from '@app/common';

constructor(private readonly gateway: GatewayService) {}

async someMethod() {
  // Gọi market-service từ auth-service
  const candles = await this.gateway.runOperation({
    serviceId: SERVICE.MARKET,
    operationId: MARKET_OPERATION.GET_CANDLES,
    payload: {
      symbol: 'BTCUSDT',
      timeframe: '1h',
      limit: 100
    }
  });
}
```

### Luồng RPC call:

```
Service A (auth-service)
    ↓ gateway.runOperation({ serviceId: 'market', ... })
GatewayService (trong auth)
    ↓ TCP RPC tới market:8004
GatewayController (trong market)
    ↓ handleGatewayRunOperation()
CommandBus.execute(GetCandlesCommand)
    ↓
GetCandlesHandler.execute()
    ↓
MarketService.getCandles()
    ↓ Response
Service A nhận kết quả
```

## 💾 3. SERVICE ↔ DATABASE

### Database Setup:

- **auth-service**: `postgres:5433/postgres`
- **user-service**: `postgres:5434/user_db`
- **news-service + news-ai-service**: `postgres:5435/news_db` (shared)
- **market-service**: Không có DB (gọi Binance API trực tiếp)

### TypeORM Connection:

```typescript
// database.module.ts
TypeOrmModule.forRoot({
  type: "postgres",
  host: getConfig("database.host"),
  port: getConfig("database.port"),
  username: getConfig("database.username"),
  password: getConfig("database.password"),
  database: getConfig("database.dbName"),
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: true, // Dev only!
});
```

## 🌐 4. MARKET-SERVICE ARCHITECTURE

### Đặc biệt: Market service có **WebSocket Gateway**

```
Frontend Client
    ↓ Socket.IO
PriceStreamGateway (:4002/price namespace)
    ↓ Listen to
BinanceStreamService
    ↓ WebSocket
Binance Stream API (wss://stream.binance.com)
```

### Dual API:

1. **HTTP REST** - Cho historical data (candles, symbols)
2. **WebSocket** - Cho real-time price streaming

### Ports Summary:

- **HTTP REST**: 4002 (qua Kong: `/api/market`)
- **WebSocket**: 4002 (namespace: `/price`)
- **RPC**: 8004 (internal only)

## 📝 CONFIG STRUCTURE

Mỗi service cần:

```javascript
// config/default.js
module.exports = {
  port: 4002, // HTTP port
  appName: "market-service",
  core: {
    gateway: {
      initServices: ["market"],
      services: {
        market: {
          transport: 0, // TCP
          options: {
            host: "localhost",
            port: 8004, // RPC port
          },
        },
        // Danh sách services khác để gọi
      },
    },
  },
};
```

## ✅ CHECKLIST TẠO SERVICE MỚI

1. ✅ Tạo config với `core.gateway`
2. ✅ Thêm `@app/common`, `@app/core`, `@nestjs/cqrs`, `@nestjs/microservices`
3. ✅ Import `CoreModule.forRoot()` trong AppModule
4. ✅ Tạo CQRS Commands + Handlers
5. ✅ Tạo `OperationsMap` và đăng ký qua `GatewayModule.forFeature()`
6. ✅ Thêm route vào Kong config
7. ✅ Sử dụng `setupBootstrap()` trong main.ts
8. ✅ Định nghĩa operations trong `@app/common/constants`

## 🎯 SỰ KHÁC BIỆT MARKET-SERVICE

Market-service **KHÔNG CẦN DATABASE** vì:

- Lấy data trực tiếp từ Binance API
- Real-time streaming từ Binance WebSocket
- Không lưu trữ historical data

Nhưng **VẪN CẦN**:

- ✅ RPC Gateway (để services khác gọi)
- ✅ CQRS structure
- ✅ HTTP REST API (cho frontend qua Kong)
- ✅ WebSocket Gateway (cho real-time updates)

---

**Tóm lại**: Mọi service đều tuân theo pattern **HTTP (external) + RPC (internal) + CQRS**, trừ các service đặc biệt như news-ai-service (chỉ consume SQS, không expose API).

# News Service - Cấu trúc theo chuẩn Auth Service

## 📋 Các thay đổi đã thực hiện

### 1. ✅ Cập nhật Dependencies (package.json)

- Thêm `@app/common` và `@app/core` vào dependencies
- Thêm `@nestjs/cqrs` và `@nestjs/microservices` cho CQRS pattern
- Thêm `@nestjs/swagger` cho API documentation
- Thêm `pg` driver cho PostgreSQL
- Thêm `class-transformer` cho DTO transformation

### 2. ✅ Config Files (config/)

**config/default.js:**

- Port: 4003 (HTTP) và 8003 (Microservice TCP)
- Database: PostgreSQL (port 5435, db: news_db)
- Core gateway configuration cho inter-service communication
- News crawl settings

**config/custom-environment-variables.js:**

- Environment variable mappings

### 3. ✅ Main Files

**src/main.ts:**

```typescript
import { setupBootstrap } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupBootstrap(app); // Tự động setup Swagger, CORS, Microservices
}
bootstrap();
```

**src/app.module.ts:**

```typescript
import { CoreModule } from '@app/core';
import { getConfig } from '@app/common';

@Module({
  imports: [
    CoreModule.forRoot(), // Gateway service
    ScheduleModule.forRoot(), // Cron jobs
    DatabaseModule,
    GatewayModule, // Inter-service communication
    NewsModule,
  ],
})
export class AppModule {}
```

### 4. ✅ Entity với BaseEntity

**src/news/entities/news-article.entity.ts:**

```typescript
import { BaseEntity } from '@app/common';

@Entity('news_article')
export class NewsArticle extends BaseEntity {
  // Tự động có: id (uuid), createdAt, updatedAt, deletedAt

  @Column()
  source: string;

  @Column()
  externalId: string;

  @Column()
  title: string;

  // ... other fields
}
```

### 5. ✅ Commands Structure (CQRS Pattern)

**src/news/commands/impl/:**

- `get-latest-news.command.ts`
- `get-news-by-symbol.command.ts`
- `trigger-crawl.command.ts`
- `index.ts` - OperationsMap registration

**src/news/commands/handlers/:**

- `get-latest-news.handler.ts`
- `get-news-by-symbol.handler.ts`
- `trigger-crawl.handler.ts`

**Đăng ký trong packages/common/src/constants/service-operation.constants.ts:**

```typescript
export const NEWS_OPERATION = {
  GET_LATEST_NEWS: 'get-latest-news',
  GET_NEWS_BY_SYMBOL: 'get-news-by-symbol',
  TRIGGER_CRAWL: 'trigger-crawl',
};
```

### 6. ✅ Controller với Guards & ResponseBuilder

**src/news/controllers/news.controller.ts:**

```typescript
import {
  ResponseBuilder,
  ApiResponseDto,
  Public,
  UserSession,
} from '@app/common';
import { JwtAuthGuard } from '@app/core';

@Controller({ path: 'news', version: '1' })
@UseGuards(JwtAuthGuard)
export class NewsController {
  @Get()
  @Public() // Không cần authentication
  async findAll(@Query('limit') limit?: number) {
    const news = await this.newsService.findAll(limit);
    return ResponseBuilder.createResponse({
      data: news,
      message: 'Latest news retrieved successfully',
    });
  }

  @Post('sync')
  @ApiBearerAuth() // Cần JWT token
  async manualSync(@UserSession() user: TokenPayload) {
    this.newsService.handleCron();
    return ResponseBuilder.createResponse({
      message: 'News synchronization triggered',
      data: null,
    });
  }
}
```

### 7. ✅ Gateway Module cho Inter-Service Communication

**src/gateway/gateway.controller.ts:**

```typescript
@Controller()
export class GatewayController {
  @MessagePattern('*')
  async handleOperation(@Payload() payload) {
    return await this.gatewayService.runCommand({
      operationId: payload.operationId,
      payload: payload.data,
    });
  }
}
```

### 8. ✅ News Module với CQRS

**src/news/news.module.ts:**

```typescript
@Module({
  imports: [
    CqrsModule,
    GatewayModule.forFeature(OperationsMap), // Đăng ký operations
    TypeOrmModule.forFeature([NewsArticle]),
    HttpModule,
  ],
  controllers: [NewsController],
  providers: [
    NewsService,
    CryptoCompareService,
    ...CommandHandlers, // Đăng ký handlers
  ],
  exports: [NewsService],
})
export class NewsModule {}
```

## 🔄 Luồng hoạt động

### 1. Frontend gọi REST API

```
GET /api/v1/news?limit=10
→ NewsController.findAll()
→ NewsService.findAll()
→ ResponseBuilder.createResponse({ data: news })
```

### 2. Service khác gọi News Service

```
// From market-service hoặc service khác
gatewayService.runOperation({
  serviceId: SERVICE.NEWS,
  operationId: NEWS_OPERATION.GET_NEWS_BY_SYMBOL,
  payload: { symbol: 'BTC' }
})
↓ TCP (port 8003)
→ GatewayController (news-service)
→ OperationsMap['get-news-by-symbol'] = GetNewsBySymbolCommand
→ CommandBus.execute(GetNewsBySymbolCommand)
→ GetNewsBySymbolHandler.execute()
→ newsService.findBySymbol('BTC')
→ Return news array
```

### 3. Cron Job tự động crawl news

```
Every 5 minutes (@Cron decorator)
→ NewsService.handleCron()
→ NewsService.syncFromSource(CryptoCompareService)
→ Crawl news from API
→ Check duplicates
→ Save to database
```

## 📡 API Endpoints

### Public Endpoints (không cần JWT)

- `GET /api/v1/news` - Get latest news
- `GET /api/v1/news/symbol/:symbol` - Get news by crypto symbol
- `GET /api/v1/news/:id` - Get news by ID

### Protected Endpoints (cần JWT token)

- `POST /api/v1/news/sync` - Manually trigger news crawl

## 🔌 Inter-Service Operations

Services khác có thể gọi:

- `NEWS_OPERATION.GET_LATEST_NEWS` - Lấy tin tức mới nhất
- `NEWS_OPERATION.GET_NEWS_BY_SYMBOL` - Lấy tin theo crypto symbol
- `NEWS_OPERATION.TRIGGER_CRAWL` - Trigger crawl manually

## 🚀 Cách chạy

```bash
# Install dependencies
cd apps/news-service
npm install

# Build shared packages first
cd ../../packages/common && npm run build
cd ../core && npm run build

# Run news-service
cd ../../apps/news-service
npm run start:dev
```

## 📊 Database Schema

```sql
CREATE TABLE news_article (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR NOT NULL,
  external_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  url VARCHAR NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  symbols TEXT[],
  author VARCHAR,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(source, external_id)
);

CREATE INDEX idx_news_symbols ON news_article USING GIN(symbols);
CREATE INDEX idx_news_published ON news_article(published_at DESC);
```

## ✅ Checklist hoàn thành

- [x] Package.json dependencies
- [x] Config files (default.js, custom-environment-variables.js)
- [x] app.module.ts (CoreModule, GatewayModule)
- [x] main.ts (setupBootstrap)
- [x] Entity với BaseEntity
- [x] Commands structure (impl + handlers)
- [x] Controller với Guards & ResponseBuilder
- [x] News.module.ts với CQRS
- [x] Gateway module cho inter-service calls
- [x] Service operations constants
- [x] News service methods (findAll, findOne, findBySymbol)

## 🎯 Kết quả

News service giờ đã:

- ✅ Follow cùng architecture pattern với auth-service
- ✅ Sử dụng shared packages (@app/common, @app/core)
- ✅ Hỗ trợ inter-service communication qua CQRS commands
- ✅ Có JWT authentication cho protected endpoints
- ✅ Response format nhất quán với ResponseBuilder
- ✅ Swagger documentation tự động
- ✅ Microservice transport (TCP) sẵn sàng
- ✅ Cron jobs để crawl news định kỳ

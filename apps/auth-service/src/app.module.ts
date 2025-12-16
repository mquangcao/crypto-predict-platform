import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@app/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfig } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: getConfig('database.type'),
      host: getConfig('database.host'),
      port: getConfig('database.port'),
      username: getConfig('database.username'),
      password: getConfig<string>('database.password'),
      database: getConfig('database.dbName'),
      synchronize: getConfig('database.synchronize'),
      autoLoadEntities: true,
    } as TypeOrmModuleOptions),
    CoreModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

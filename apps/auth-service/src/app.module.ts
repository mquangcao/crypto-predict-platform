import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@app/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfig } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: getConfig('core.database.type'),
      host: getConfig('core.database.host'),
      port: getConfig('core.database.port'),
      username: getConfig('core.database.username'),
      password: getConfig<string>('core.database.password'),
      database: getConfig('core.database.dbName'),
      synchronize: getConfig('core.database.synchronize'),
      autoLoadEntities: true,
    } as TypeOrmModuleOptions),
    CoreModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

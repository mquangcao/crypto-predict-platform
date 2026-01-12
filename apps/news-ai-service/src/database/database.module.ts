import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfig } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: getConfig('database.type'),
      host: getConfig('database.host'),
      port: getConfig('database.port'),
      username: getConfig('database.username'),
      password: getConfig('database.password'),
      database: getConfig('database.dbName'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: getConfig('database.synchronize'),
      logging: getConfig('database.logging'),
    } as TypeOrmModuleOptions),
  ],
})
export class DatabaseModule {}

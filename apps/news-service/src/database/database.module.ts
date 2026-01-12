import { getConfig } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

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
  ],
})
export class DatabaseModule {}
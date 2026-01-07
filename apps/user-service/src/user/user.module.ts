import { GatewayModule } from '@app/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from './commands/handlers';
import { OperationMap } from './commands/impl';
import { UserMeController } from './controllers/user-me.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), GatewayModule.forFeature(OperationMap)],
  controllers: [UserMeController],
  providers: [UserService, ...CommandHandlers],
  exports: [TypeOrmModule],
})
export class UserModule {}

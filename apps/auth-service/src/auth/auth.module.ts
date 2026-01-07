import { GatewayModule } from '@app/core';
import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from './commands/handlers';
import { OperationsMap } from './commands/impl';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserRoleToTokenRoleMapper } from './mapper/token-role.mapper';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { LocalStrategy } from './strategies';

export interface AuthModuleOptions {
  jwtSecret: string;
  jwtExpiresIn?: number;
}
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        TypeOrmModule.forFeature([RefreshTokenEntity]),
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: { expiresIn: options.jwtExpiresIn || 3600 },
        }),
        GatewayModule.forFeature(OperationsMap),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        TokenService,
        UserRoleToTokenRoleMapper,
        LocalStrategy,
        ...CommandHandlers,
      ],
      exports: [AuthService, TokenService, UserRoleToTokenRoleMapper, TypeOrmModule],
    };
  }

  static forFeature(strategies: any[]): DynamicModule {
    return {
      module: AuthModule,
      providers: [...strategies],
      exports: [...strategies],
    };
  }
}

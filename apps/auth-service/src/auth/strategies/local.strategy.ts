import { Strategy } from 'passport-local';

import { PasswordHash, SERVICE, USER_OPERATION } from '@app/common';
import { GatewayService } from '@app/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private gatewayService: GatewayService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new UnauthorizedException('Username and password are required');
    }

    const user = await this.gatewayService.runOperation({
      serviceId: SERVICE.AUTH,
      operationId: USER_OPERATION.FIND_USER_BY_IDENTIFIER,
      payload: {
        identifier: username,
      },
    });

    if (!user || !(user as any).password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = this.comparePasswords(password, (user as any).password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private comparePasswords(plainPassword: string, hashedPassword: string): boolean {
    return PasswordHash.comparePassword(plainPassword, hashedPassword);
  }
}

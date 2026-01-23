import { Repository } from 'typeorm';

import { SERVICE, USER_OPERATION, UserRole } from '@app/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginResponseDto } from '../dtos/login-response.dto';
import { OAuthTempCodeEntity } from '../entities/oauth-temp-code.entity';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { GatewayService } from '@app/core';

@Injectable()
export class OpenIdService {
  constructor(
    @InjectRepository(OAuthTempCodeEntity)
    private readonly oauthTempCodeRepository: Repository<OAuthTempCodeEntity>,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly gatewayService: GatewayService
  ) {}

  async createOAuthTempCode(profile: {
    providerId: string;
    provider: string;
    email: string;
    fullName: string;
    picture?: string;
  }): Promise<string> {
    // Try to find existing user by email
    let user = await this.gatewayService.runOperation({
      serviceId: SERVICE.USER,
      operationId: USER_OPERATION.FIND_USER_BY_IDENTIFIER,
      payload: { identifier: profile.email },
    })

    if (!user) {
      user = await this.gatewayService.runOperation({
        serviceId: SERVICE.USER,
        operationId: USER_OPERATION.CREATE_USER,
        payload: {
          username: profile.email,
          email: profile.email,
          fullName: profile.fullName,
          role: UserRole.BASIC,
          password: undefined, 
        },
      });
    }

    // Generate a random temporary code
    const code = this.tokenService.generateRandomToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save the temporary code
    await this.oauthTempCodeRepository.save({
      code,
      userId: (user as any).id,
      expiresAt,
      used: false,
    });

    return code;
  }

  async exchangeOAuthCode(code: string): Promise<LoginResponseDto> {
    const tempCode = await this.oauthTempCodeRepository.findOne({
      where: { code },
    });

    if (!tempCode) {
      throw new UnauthorizedException('Invalid authorization code');
    }

    if (tempCode.used) {
      throw new UnauthorizedException('Authorization code already used');
    }

    if (tempCode.expiresAt < new Date()) {
      await this.oauthTempCodeRepository.delete({ code });
      throw new UnauthorizedException('Authorization code expired');
    }

    // Mark as used
    tempCode.used = true;
    await this.oauthTempCodeRepository.save(tempCode);

    // Get user and generate tokens
    const user = await this.gatewayService.runOperation({
      serviceId: SERVICE.USER,
      operationId: USER_OPERATION.FIND_USER_BY_ID,
      payload: { id: tempCode.userId },
    }) ;
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete the temporary code
    await this.oauthTempCodeRepository.delete({ code });

    return this.authService.login({ id: (user as any).id, role: (user as any).role });
  }

  async cleanupExpiredCodes(): Promise<void> {
    await this.oauthTempCodeRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}

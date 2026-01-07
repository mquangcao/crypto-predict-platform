import { Repository } from 'typeorm';

import { SERVICE, USER_OPERATION, UserRole } from '@app/common';
import { GatewayService } from '@app/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginResponseDto } from '../dtos/login-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterRequestDto } from '../dtos/register-request.dto';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UserRoleToTokenRoleMapper } from '../mapper/token-role.mapper';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly tokenService: TokenService,
    private readonly mapper: UserRoleToTokenRoleMapper,
    private readonly gatewayService: GatewayService,
  ) {}

  async login(user: { id: string; role: UserRole }): Promise<LoginResponseDto> {
    const tokenRole = this.mapper.map(user.role);
    const { accessToken, refreshToken, refreshId, expiresIn } =
      await this.tokenService.generateTokens(user.id, tokenRole);

    const refreshTokenExpiresAt = new Date(
      Date.now() + this.tokenService.getRefreshTokenExpiresIn() * 1000,
    );
    await this.refreshTokenRepository.save({
      id: refreshId,
      userId: user.id,
      tokenRole,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_role: tokenRole,
      expires_in: expiresIn,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { id: dto.refreshToken },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { accessToken, refreshToken, refreshId, expiresIn } =
      await this.tokenService.generateTokens(
        { id: refreshTokenRecord.userId } as any,
        refreshTokenRecord.tokenRole,
      );

    refreshTokenRecord.id = refreshId;
    refreshTokenRecord.expiresAt = new Date(
      Date.now() + this.tokenService.getRefreshTokenExpiresIn() * 1000,
    );

    await this.refreshTokenRepository.save(refreshTokenRecord);

    await this.refreshTokenRepository.delete({
      userId: refreshTokenRecord.userId,
      id: dto.refreshToken,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_role: refreshTokenRecord.tokenRole,
      expires_in: expiresIn,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async register(dto: RegisterRequestDto): Promise<LoginResponseDto> {
    const user = await this.gatewayService.runOperation({
      serviceId: SERVICE.USER,
      operationId: USER_OPERATION.CREATE_USER,
      payload: {
        email: dto.email,
        username: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        role: UserRole.BASIC,
      },
    });

    return this.login({ id: (user as any).id, role: (user as any).role });
  }
}

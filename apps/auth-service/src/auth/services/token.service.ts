import { v4 as uuidv4 } from 'uuid';

import { getConfig } from '@app/common';
import { TokenPayload, TokenRole } from '@app/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  refreshId: string;
  expiresIn: number;
}

@Injectable()
export class AccountTokenService {
  private readonly ACCESS_TOKEN_EXPIRES_IN = getConfig('token.expiresIn');
  private readonly REFRESH_TOKEN_EXPIRES_IN = getConfig('token.refreshExpiresIn');

  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(userId: string, tokenRole: TokenRole): Promise<GeneratedTokens> {
    const payload: TokenPayload = {
      sub: userId,
      tokenRole,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshId = uuidv4();

    return {
      accessToken,
      refreshToken: refreshId,
      refreshId,
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  getRefreshTokenExpiresIn(): number {
    return this.REFRESH_TOKEN_EXPIRES_IN;
  }
}

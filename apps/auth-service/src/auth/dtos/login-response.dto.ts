import { TokenRole } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'd1f3c4e5-6b7a-8c9d-0e1f-2a3b4c5d6e7f',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Role of the token',
    enum: TokenRole,
    example: TokenRole.BASIC,
  })
  token_role: TokenRole;

  @ApiProperty({
    description: 'Expiration time of the access token in seconds',
    example: 3600,
  })
  expires_in: number;
}

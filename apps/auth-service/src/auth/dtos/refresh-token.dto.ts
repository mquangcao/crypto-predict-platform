import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token used to obtain a new access token',
    example: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQ5c...',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  refreshToken: string;
}

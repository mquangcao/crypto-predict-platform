import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ExchangeOAuthCodeDto {
  @ApiProperty({
    description: 'Temporary OAuth authorization code',
    example: 'abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  code: string;
}

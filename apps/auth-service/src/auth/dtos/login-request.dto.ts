import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: 'User credentials',
    example: 'admin@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  password: string;
}

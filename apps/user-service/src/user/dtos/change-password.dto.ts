import { Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword', description: 'The current password of the user' })
  @MinLength(1)
  @IsString()
  @Expose()
  currentPassword!: string;

  @ApiProperty({ example: 'newPassword', description: 'New password (min 8 characters)' })
  @MinLength(8)
  @IsString()
  @Expose()
  newPassword!: string;

  @ApiProperty({ example: 'newPassword', description: 'Confirm new password' })
  @MinLength(8)
  @IsString()
  @Expose()
  confirmNewPassword!: string;
}

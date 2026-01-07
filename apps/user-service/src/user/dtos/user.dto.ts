import { Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

import { BaseEntityDto, UserRole, UserStatus } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto extends BaseEntityDto {
  @ApiProperty({ example: 'uuid_value', description: 'The user ID' })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({ example: 'username123', description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Expose()
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
  @IsString()
  @IsEmail()
  @Length(3, 50)
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  @IsString()
  @Length(3, 50)
  @Expose()
  fullName: string;

  @ApiProperty({ enum: UserRole, description: 'The role of the user', default: UserRole.BASIC })
  @IsEnum(UserRole)
  @Expose()
  role: UserRole;

  @ApiProperty({
    enum: UserStatus,
    description: 'The status of the user',
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @Expose()
  status: UserStatus;
}

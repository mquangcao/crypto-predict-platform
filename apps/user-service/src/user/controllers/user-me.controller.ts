import { plainToInstance } from 'class-transformer';

import { ApiResponseDto, ResponseBuilder, TokenPayload, UserSession } from '@app/common';
import { JwtAuthGuard } from '@app/core';
import { BadRequestException, Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDto } from '../dtos/user.dto';
import { UserService } from '../services/user.service';
import { UpdateMeDto } from '../dtos/update-me.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@ApiTags('User / Me')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'user/me',
  version: '1',
})
export class UserMeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user info' })
  @ApiOkResponse({
    type: ApiResponseDto(UserDto),
    description: 'Return user info',
  })
  @ApiBearerAuth()
  async me(@UserSession() user: TokenPayload) {
    const data = await this.userService.findById(user.sub);
    return ResponseBuilder.createResponse({
      data: plainToInstance(UserDto, data, { excludeExtraneousValues: true }),
    });
  }

  @Put()
  @ApiOperation({ summary: 'Update user info (email, fullname)' })
  @ApiOkResponse({ type: ApiResponseDto(UserDto), description: 'Return updated user' })
  @ApiBearerAuth()
  async updateMe(@UserSession() user: TokenPayload, @Body() payload: UpdateMeDto) {
    const updated = await this.userService.update(user.sub, payload);
    return ResponseBuilder.createResponse({
      data: plainToInstance(UserDto, updated, { excludeExtraneousValues: true }),
    });
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBearerAuth()
  async changePassword(@UserSession() user: TokenPayload, @Body() payload: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmNewPassword } = payload;
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New password and confirm new password do not match');
    }

    await this.userService.changePassword(user.sub, currentPassword, newPassword);
    return ResponseBuilder.createResponse({
      data: null,
      message: 'Password changed successfully',
    });
  }
}

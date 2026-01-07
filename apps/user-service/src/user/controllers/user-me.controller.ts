import { plainToInstance } from 'class-transformer';

import { ApiResponseDto, ResponseBuilder, TokenPayload, UserSession } from '@app/common';
import { JwtAuthGuard } from '@app/core';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDto } from '../dtos/user.dto';
import { UserService } from '../services/user.service';

@ApiTags('Account / Me')
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
}

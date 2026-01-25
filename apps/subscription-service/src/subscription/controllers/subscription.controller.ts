import { plainToInstance } from 'class-transformer';
import { ApiResponseDto, ResponseBuilder, TokenPayload, UserSession } from '@app/common';
import { JwtAuthGuard } from '@app/core';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionDto } from '../dtos/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiOkResponse({
    type: ApiResponseDto(SubscriptionDto),
    description: 'Return current subscription',
  })
  async getMySubscription(@UserSession() user: TokenPayload) {
    const data = await this.subscriptionService.findActiveSubscription(user.sub);
    return ResponseBuilder.createResponse({
      data: plainToInstance(SubscriptionDto, data, { excludeExtraneousValues: true }),
    });
  }
}

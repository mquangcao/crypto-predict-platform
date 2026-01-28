import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionService } from '../../services/subscription.service';
import { CheckVipCommand } from '../impl/check-vip.command';
import { Logger } from '@nestjs/common';

@CommandHandler(CheckVipCommand)
export class CheckVipHandler implements ICommandHandler<CheckVipCommand> {
  private readonly logger = new Logger(CheckVipHandler.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async execute(command: CheckVipCommand) {
    const activeSub = await this.subscriptionService.findActiveSubscription(command.userId);
    return !!activeSub;
  }
}

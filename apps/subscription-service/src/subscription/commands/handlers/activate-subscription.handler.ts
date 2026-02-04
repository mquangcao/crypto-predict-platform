import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionService } from '../../services/subscription.service';
import { ActivateSubscriptionCommand } from '../impl/activate-subscription.command';
import { Logger } from '@nestjs/common';

@CommandHandler(ActivateSubscriptionCommand)
export class ActivateSubscriptionHandler implements ICommandHandler<ActivateSubscriptionCommand> {
  private readonly logger = new Logger(ActivateSubscriptionHandler.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async execute(command: ActivateSubscriptionCommand) { 
    return await this.subscriptionService.createOrExtendSubscription({
      userId: command.userId,
      planId: command.planId,
      planName: command.planName,
      interval: command.interval as 'month' | 'year',
      metadata: command.metadata,
    });
  }
}

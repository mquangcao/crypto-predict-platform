import { BaseCommand } from '@app/common';

export class ActivateSubscriptionCommand extends BaseCommand {
  userId: string;
  planId: string;
  planName: string;
  interval: string;
  metadata?: any;
}

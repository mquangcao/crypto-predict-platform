import { BaseCommand } from '@app/common';

export class GetPlanForPaymentCommand extends BaseCommand {
  planId: string;
  interval: 'month' | 'year';
}

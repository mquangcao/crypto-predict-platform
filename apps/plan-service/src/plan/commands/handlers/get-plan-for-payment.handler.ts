import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlanService } from '../../services/plan.service';
import { GetPlanForPaymentCommand } from '../impl/get-plan-for-payment.command';

@CommandHandler(GetPlanForPaymentCommand)
export class GetPlanForPaymentHandler implements ICommandHandler<GetPlanForPaymentCommand> {
  constructor(private readonly planService: PlanService) {}

  async execute(command: GetPlanForPaymentCommand) {
    const { planId, interval } = command;
    return this.planService.getPlanForPayment(planId, interval);
  }
}

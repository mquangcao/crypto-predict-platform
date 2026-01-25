import { PLAN_OPERATION } from '@app/common';
import { GetPlanForPaymentCommand } from './get-plan-for-payment.command';

export const OperationMap = {
  [PLAN_OPERATION.GET_PLAN_FOR_PAYMENT]: GetPlanForPaymentCommand,
};

export * from './get-plan-for-payment.command';

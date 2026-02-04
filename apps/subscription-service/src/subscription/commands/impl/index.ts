import { SUBSCRIPTION_OPERATION } from '@app/common';
import { ActivateSubscriptionCommand } from './activate-subscription.command';
import { CheckVipCommand } from './check-vip.command';

export const OperationMap = {
  [SUBSCRIPTION_OPERATION.ACTIVATE_SUBSCRIPTION]: ActivateSubscriptionCommand,
  [SUBSCRIPTION_OPERATION.CHECK_VIP]: CheckVipCommand,
};

export { ActivateSubscriptionCommand, CheckVipCommand };

import { SUBSCRIPTION_OPERATION } from '@app/common';
import { ActivateSubscriptionCommand } from './activate-subscription.command';

export const OperationMap = {
  [SUBSCRIPTION_OPERATION.ACTIVATE_SUBSCRIPTION]: ActivateSubscriptionCommand,
};

export { ActivateSubscriptionCommand };

import { AUTH_OPERATION } from '@app/common';

import { FindUserByIdentifierCommand } from './find-user-by-identifier.command';

export const OperationMap = {
  [AUTH_OPERATION.VERIFY_ACCESS_TOKEN]: FindUserByIdentifierCommand,
};

export { FindUserByIdentifierCommand };

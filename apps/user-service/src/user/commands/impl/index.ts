import { USER_OPERATION } from '@app/common';

import { FindUserByIdentifierCommand } from './find-user-by-identifier.command';

export const OperationMap = {
  [USER_OPERATION.FIND_USER_BY_IDENTIFIER]: FindUserByIdentifierCommand,
};

export { FindUserByIdentifierCommand };

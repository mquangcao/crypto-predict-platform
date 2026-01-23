import { USER_OPERATION } from '@app/common';

import { CreateUserCommand } from './create-user.command';
import { FindUserByIdentifierCommand } from './find-user-by-identifier.command';
import { FindUserByIdCommand } from './find-user-by-id.command';

export const OperationMap = {
  [USER_OPERATION.FIND_USER_BY_IDENTIFIER]: FindUserByIdentifierCommand,
  [USER_OPERATION.CREATE_USER]: CreateUserCommand,
  [USER_OPERATION.FIND_USER_BY_ID]: FindUserByIdCommand,
};

export { FindUserByIdentifierCommand, CreateUserCommand, FindUserByIdCommand };
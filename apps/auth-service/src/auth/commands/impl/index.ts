import { AUTH_OPERATION } from '@app/common';

import { VerifyAccessTokenCommand } from './verify-access-token.command';

export const OperationsMap = {
  [AUTH_OPERATION.VERIFY_ACCESS_TOKEN]: VerifyAccessTokenCommand,
};

export { VerifyAccessTokenCommand };

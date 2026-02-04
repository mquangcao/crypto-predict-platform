import { CreateUserHandler } from './create-user.handler';
import { FindUserByIdHandler } from './find-user-by-id.handler';
import { FindUserByIdentifierHandler } from './find-user-by-identifier.handler';

export const CommandHandlers = [FindUserByIdentifierHandler, CreateUserHandler, FindUserByIdHandler];

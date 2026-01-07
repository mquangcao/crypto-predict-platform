import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { FindUserByIdentifierCommand } from '../impl';

@CommandHandler(FindUserByIdentifierCommand)
export class FindUserByIdentifierHandler implements ICommandHandler<FindUserByIdentifierCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: FindUserByIdentifierCommand): Promise<UserEntity | null> {
    return this.userService.findByUsernameOrEmail(command.identifier);
  }
}

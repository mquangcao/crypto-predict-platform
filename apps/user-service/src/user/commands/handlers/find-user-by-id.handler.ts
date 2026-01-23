import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { FindUserByIdCommand } from '../impl';

@CommandHandler(FindUserByIdCommand)
export class FindUserByIdHandler implements ICommandHandler<FindUserByIdCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: FindUserByIdCommand): Promise<UserEntity | null> {
    return this.userService.findById(command.id);
  }
}
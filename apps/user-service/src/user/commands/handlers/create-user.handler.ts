import { PasswordHash } from '@app/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { CreateUserCommand } from '../impl';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<UserEntity> {
    const userData = UserEntity.create({
      username: command.username,
      email: command.email,
      fullName: command.fullName,
      role: command.role,
      password: command.password ? PasswordHash.hashPassword(command.password) : undefined,
    });

    return await this.userService.create(userData);
  }
}

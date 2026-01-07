import { BaseCommand, UserRole } from '@app/common';

export class CreateUserCommand extends BaseCommand {
  username: string;
  email: string;
  fullName: string;
  role?: UserRole;
  password?: string;
}

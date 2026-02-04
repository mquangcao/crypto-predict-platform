import { Mapper, TokenRole, UserRole } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRoleToTokenRoleMapper extends Mapper<UserRole, TokenRole> {
  map(source: UserRole): TokenRole {
    switch (source) {
      case UserRole.ADMIN:
        return TokenRole.ADMIN;
      case UserRole.BASIC:
        return TokenRole.BASIC;
      default:
        return TokenRole.BASIC;
    }
  }
}

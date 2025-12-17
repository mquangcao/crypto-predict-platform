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
      case UserRole.ANONYMOUS:
        return TokenRole.GUEST;
      case UserRole.SYSTEM:
        return TokenRole.ADMIN;
      default:
        return TokenRole.GUEST;
    }
  }
}

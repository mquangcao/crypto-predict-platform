import { Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findByUsernameOrEmail(identifier: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.findByUsernameOrEmail(user.username);
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    return this.userRepo.save(user);
  }
}

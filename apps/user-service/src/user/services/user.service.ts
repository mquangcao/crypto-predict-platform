import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../entities/user.entity';
import { PasswordHash } from '@app/common';

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

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const entity = await this.userRepo.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`User not found`);
    }
    return this.userRepo.save(Object.assign(entity, data));
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<UserEntity> {
    const before = await this.userRepo.findOne({ where: { id: userId } });

    if (
      !before ||
      !before.password ||
      !PasswordHash.comparePassword(currentPassword, before.password)
    ) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = PasswordHash.hashPassword(newPassword);
    return this.update(userId, { password: hashed } as any);
  }
}

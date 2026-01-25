import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { PasswordHash, UserRole, UserStatus } from '@app/common';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@example.com';
    const adminExists = await this.userRepo.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      const admin = new UserEntity();
      admin.username = adminEmail;
      admin.email = adminEmail;
      admin.fullName = 'System Administrator';
      admin.password = PasswordHash.hashPassword('admin123456');
      admin.role = UserRole.ADMIN;
      admin.status = UserStatus.ACTIVE;

      await this.userRepo.save(admin);
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
  }
}

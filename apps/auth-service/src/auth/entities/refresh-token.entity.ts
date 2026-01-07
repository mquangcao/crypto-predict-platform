import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TokenRole } from '@app/common';

@Entity({
  name: 'refresh_tokens',
})
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ enum: TokenRole, type: 'enum' })
  tokenRole: TokenRole;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoryEntity } from './story.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['isActive'])
@Index(['emailVerifiedAt'])
@Index(['createdAt'])
@Index(['lastLoginAt'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_login_at',
  })
  lastLoginAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'email_verified_at',
  })
  emailVerifiedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => StoryEntity, (story) => story.user)
  stories!: StoryEntity[];
}

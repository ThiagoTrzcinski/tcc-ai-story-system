import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoryGenre } from '../domain/value-objects/story-genre.value-object';
import { StoryStatus } from '../domain/value-objects/story-status.value-object';
import { StoryChoiceEntity } from './story-choice.entity';
import { StoryContentEntity } from './story-content.entity';
import { UserEntity } from './user.entity';

@Entity('stories')
@Index(['userId'])
@Index(['status'])
@Index(['genre'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class StoryEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StoryGenre,
    nullable: false,
  })
  genre!: StoryGenre;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @ManyToOne(() => UserEntity, (user) => user.stories)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    type: 'enum',
    enum: StoryStatus,
    default: StoryStatus.DRAFT,
    nullable: false,
  })
  status!: StoryStatus;

  @Column({ name: 'current_content_id', type: 'uuid', nullable: true })
  currentContentId?: string;

  @Column({
    name: 'total_choices_made',
    type: 'integer',
    default: 0,
    nullable: true,
  })
  totalChoicesMade?: number;

  @Column({ name: 'estimated_reading_time', type: 'integer', nullable: true })
  estimatedReadingTime?: number;

  @Column({ type: 'text', array: true, nullable: true })
  prompts?: string[];

  @Column({ type: 'jsonb', nullable: false, default: '{"AIModel": "mocked"}' })
  settings!: { AIModel: string };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => StoryContentEntity, (content) => content.story, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  content!: StoryContentEntity[];

  @OneToMany(() => StoryChoiceEntity, (choice) => choice.story, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  choices!: StoryChoiceEntity[];
}

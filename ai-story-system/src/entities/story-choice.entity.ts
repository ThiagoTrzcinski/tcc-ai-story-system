import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChoiceType } from '../domain/value-objects/choice-type.value-object';
import { StoryContentEntity } from './story-content.entity';
import { StoryEntity } from './story.entity';

@Entity('story_choices')
@Index(['storyId', 'parentContentId'])
@Index(['parentContentId', 'sequence'])
@Index(['isAvailable', 'isSelected'])
@Index(['nextContentId'])
@Index(['createdAt'])
export class StoryChoiceEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'story_id', type: 'uuid', nullable: false })
  storyId!: string;

  @Column({ name: 'parent_content_id', type: 'uuid', nullable: false })
  parentContentId!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  text!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({
    type: 'enum',
    enum: ChoiceType,
    nullable: false,
  })
  type!: ChoiceType;

  @Column({ type: 'integer', nullable: false })
  sequence!: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected!: boolean;

  @Column({ name: 'selected_at', type: 'timestamp', nullable: true })
  selectedAt?: Date;

  @Column({ name: 'next_content_id', type: 'uuid', nullable: true })
  nextContentId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => StoryEntity, (story) => story.choices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'story_id' })
  story!: StoryEntity;

  @ManyToOne(() => StoryContentEntity, (content) => content.choices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_content_id' })
  parentContent!: StoryContentEntity;

  @ManyToOne(() => StoryContentEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'next_content_id' })
  nextContent?: StoryContentEntity;
}

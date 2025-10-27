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
import { StoryChoiceEntity } from './story-choice.entity';
import { StoryEntity } from './story.entity';

@Entity('story_content')
@Index(['storyId', 'sequence'])
@Index(['hasChoices'])
@Index(['createdAt'])
export class StoryContentEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'story_id', type: 'uuid', nullable: false })
  storyId!: string;

  @Column({ name: 'text_content', type: 'text', nullable: false })
  textContent!: string;

  @Column({ type: 'integer', nullable: false })
  sequence!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'audio_url', type: 'varchar', length: 500, nullable: true })
  audioUrl?: string;

  @Column({ name: 'has_choices', type: 'boolean', default: false })
  hasChoices!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => StoryEntity, (story) => story.content, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'story_id' })
  story!: StoryEntity;

  @OneToMany(() => StoryChoiceEntity, (choice) => choice.parentContent, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  choices!: StoryChoiceEntity[];
}

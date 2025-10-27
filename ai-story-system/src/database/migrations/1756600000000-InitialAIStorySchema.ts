import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAIStorySchema1756600000000 implements MigrationInterface {
  name = 'InitialAIStorySchema1756600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create story status enum
    await queryRunner.query(`
      CREATE TYPE "story_status_enum" AS ENUM (
        'draft', 
        'in_progress', 
        'completed', 
        'published', 
        'archived', 
        'deleted'
      )
    `);

    // Create story genre enum (updated with all current genres)
    await queryRunner.query(`
      CREATE TYPE "story_genre_enum" AS ENUM (
        'fantasy', 
        'science_fiction', 
        'mystery', 
        'thriller', 
        'romance', 
        'horror', 
        'adventure', 
        'drama', 
        'comedy', 
        'historical',
        'western',
        'crime',
        'supernatural',
        'dystopian',
        'steampunk',
        'cyberpunk',
        'urban_fantasy',
        'slice_of_life',
        'coming_of_age',
        'custom'
      )
    `);

    // Create choice type enum
    await queryRunner.query(`
      CREATE TYPE "choice_type_enum" AS ENUM (
        'narrative', 
        'dialogue', 
        'action', 
        'moral', 
        'strategic', 
        'exploration', 
        'relationship', 
        'skill_check', 
        'inventory', 
        'ending'
      )
    `);

    // Create stories table (simplified schema)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stories" (
        "id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "genre" "story_genre_enum" NOT NULL,
        "user_id" integer NOT NULL,
        "status" "story_status_enum" NOT NULL DEFAULT 'draft',
        "prompts" text[],
        "current_content_id" uuid,
        "total_choices_made" integer NOT NULL DEFAULT 0,
        "estimated_reading_time" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stories" PRIMARY KEY ("id")
      )
    `);

    // Create story_content table (simplified schema)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "story_content" (
        "id" uuid NOT NULL,
        "story_id" uuid NOT NULL,
        "text_content" text NOT NULL,
        "sequence" integer NOT NULL,
        "image_url" character varying(500),
        "audio_url" character varying(500),
        "has_choices" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_story_content" PRIMARY KEY ("id")
      )
    `);

    // Create story_choices table (simplified schema)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "story_choices" (
        "id" uuid NOT NULL,
        "story_id" uuid NOT NULL,
        "parent_content_id" uuid NOT NULL,
        "text" character varying(200) NOT NULL,
        "type" "choice_type_enum" NOT NULL,
        "sequence" integer NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        "is_selected" boolean NOT NULL DEFAULT false,
        "selected_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_story_choices" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "story_content"
      ADD CONSTRAINT "FK_story_content_story"
      FOREIGN KEY ("story_id") REFERENCES "stories"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD CONSTRAINT "FK_story_choices_story"
      FOREIGN KEY ("story_id") REFERENCES "stories"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD CONSTRAINT "FK_story_choices_content"
      FOREIGN KEY ("parent_content_id") REFERENCES "story_content"("id")
      ON DELETE CASCADE
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_stories_user"
      ON "stories" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stories_status"
      ON "stories" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stories_genre"
      ON "stories" ("genre")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stories_created_at"
      ON "stories" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stories_updated_at"
      ON "stories" ("updated_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_content_story_sequence"
      ON "story_content" ("story_id", "sequence")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_content_has_choices"
      ON "story_content" ("has_choices")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_content_created_at"
      ON "story_content" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_choices_story_content"
      ON "story_choices" ("story_id", "parent_content_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_choices_story_type"
      ON "story_choices" ("story_id", "type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_choices_content_sequence"
      ON "story_choices" ("parent_content_id", "sequence")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_choices_availability"
      ON "story_choices" ("is_available", "is_selected")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_choices_created_at"
      ON "story_choices" ("created_at")
    `);

    // Create unique constraints
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_story_content_story_sequence_unique"
      ON "story_content" ("story_id", "sequence")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_story_choices_content_sequence_unique"
      ON "story_choices" ("parent_content_id", "sequence")
    `);

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE "stories"
      ADD CONSTRAINT "CHK_stories_total_choices_non_negative"
      CHECK ("total_choices_made" >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "stories"
      ADD CONSTRAINT "CHK_stories_reading_time_positive"
      CHECK ("estimated_reading_time" IS NULL OR "estimated_reading_time" > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "story_content"
      ADD CONSTRAINT "CHK_story_content_sequence_positive"
      CHECK ("sequence" > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD CONSTRAINT "CHK_story_choices_sequence_positive"
      CHECK ("sequence" > 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "story_choices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "story_content"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stories"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "choice_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "story_genre_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "story_status_enum"`);
  }
}

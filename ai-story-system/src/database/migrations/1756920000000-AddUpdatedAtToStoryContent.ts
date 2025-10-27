import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtToStoryContent1756920000000
  implements MigrationInterface
{
  name = 'AddUpdatedAtToStoryContent1756920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add updated_at column to story_content table
    await queryRunner.query(`
      ALTER TABLE "story_content"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);

    // Add updated_at column to story_choices table if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);

    // Add next_content_id column to story_choices table if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD COLUMN IF NOT EXISTS "next_content_id" uuid NULL
    `);

    // Create index on updated_at for story_content table (for performance)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_story_content_updated_at"
      ON "story_content" ("updated_at")
    `);

    // Create index on updated_at for story_choices table (for performance)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_story_choices_updated_at"
      ON "story_choices" ("updated_at")
    `);

    // Add foreign key constraint for next_content_id
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      ADD CONSTRAINT "FK_story_choices_next_content"
      FOREIGN KEY ("next_content_id") REFERENCES "story_content"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      DROP CONSTRAINT IF EXISTS "FK_story_choices_next_content"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_story_choices_updated_at"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_story_content_updated_at"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      DROP COLUMN IF EXISTS "next_content_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "story_choices"
      DROP COLUMN IF EXISTS "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "story_content"
      DROP COLUMN IF EXISTS "updated_at"
    `);
  }
}

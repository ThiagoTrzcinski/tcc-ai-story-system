import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingsToStory1756910000000 implements MigrationInterface {
  name = 'AddSettingsToStory1756910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if settings column already exists
    const hasSettingsColumn = await queryRunner.hasColumn(
      'stories',
      'settings',
    );

    if (!hasSettingsColumn) {
      // Add settings column to stories table with default value
      await queryRunner.query(`
        ALTER TABLE "stories"
        ADD COLUMN "settings" jsonb NOT NULL DEFAULT '{"AIModel": "gpt-4"}'
      `);
    }

    // Update existing stories to have default settings (if they don't have any)
    await queryRunner.query(`
      UPDATE "stories"
      SET "settings" = '{"AIModel": "gpt-4"}'
      WHERE "settings" IS NULL OR "settings" = '{}'
    `);

    // Check if index already exists before creating it
    const hasIndex = await queryRunner.query(`
      SELECT 1 FROM pg_indexes
      WHERE indexname = 'IDX_stories_settings_aimodel'
    `);

    if (hasIndex.length === 0) {
      // Create index on settings for better query performance
      await queryRunner.query(`
        CREATE INDEX "IDX_stories_settings_aimodel"
        ON "stories" (("settings"->>'AIModel'))
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_stories_settings_aimodel"
    `);

    // Remove the settings column
    await queryRunner.query(`
      ALTER TABLE "stories" 
      DROP COLUMN IF EXISTS "settings"
    `);
  }
}

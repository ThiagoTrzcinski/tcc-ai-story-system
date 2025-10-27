import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToStoryChoices1756900000000 implements MigrationInterface {
  name = 'AddDescriptionToStoryChoices1756900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add description column to story_choices table
    await queryRunner.query(`
      ALTER TABLE story_choices 
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''
    `);

    // Update existing records with a default description
    await queryRunner.query(`
      UPDATE story_choices 
      SET description = 'Choice description for: ' || text 
      WHERE description = '' OR description IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove description column from story_choices table
    await queryRunner.query(`
      ALTER TABLE story_choices 
      DROP COLUMN IF EXISTS description
    `);
  }
}

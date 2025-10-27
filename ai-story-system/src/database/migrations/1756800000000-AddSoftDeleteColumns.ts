import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteColumns1756800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deleted_at column to users table if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    // Add deleted_at column to stories table if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    // Create index on deleted_at for users table (for performance on soft delete queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_users_deleted_at ON users(deleted_at)
    `);

    // Create index on deleted_at for stories table (for performance on soft delete queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_stories_deleted_at ON stories(deleted_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_stories_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_users_deleted_at`);

    // Drop columns
    await queryRunner.query(
      `ALTER TABLE stories DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS deleted_at`,
    );
  }
}

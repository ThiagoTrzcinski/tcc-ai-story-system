import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1756700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email_verified_at',
        columnNames: ['email_verified_at'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_last_login_at',
        columnNames: ['last_login_at'],
      }),
    );

    // Add foreign key constraint to stories table if it exists
    const hasStoriesTable = await queryRunner.hasTable('stories');
    if (hasStoriesTable) {
      // Check if the foreign key doesn't already exist
      const storiesTable = await queryRunner.getTable('stories');
      const hasForeignKey = storiesTable?.foreignKeys.some(
        (fk) =>
          fk.columnNames.includes('user_id') &&
          fk.referencedTableName === 'users',
      );

      if (!hasForeignKey) {
        await queryRunner.query(`
          ALTER TABLE stories 
          ADD CONSTRAINT FK_stories_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) 
          ON DELETE CASCADE
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint from stories table if it exists
    const hasStoriesTable = await queryRunner.hasTable('stories');
    if (hasStoriesTable) {
      const storiesTable = await queryRunner.getTable('stories');
      const foreignKey = storiesTable?.foreignKeys.find(
        (fk) =>
          fk.columnNames.includes('user_id') &&
          fk.referencedTableName === 'users',
      );

      if (foreignKey) {
        await queryRunner.dropForeignKey('stories', foreignKey);
      }
    }

    // Drop indexes
    await queryRunner.dropIndex('users', 'IDX_users_last_login_at');
    await queryRunner.dropIndex('users', 'IDX_users_created_at');
    await queryRunner.dropIndex('users', 'IDX_users_email_verified_at');
    await queryRunner.dropIndex('users', 'IDX_users_is_active');
    await queryRunner.dropIndex('users', 'IDX_users_email');

    // Drop users table
    await queryRunner.dropTable('users');
  }
}

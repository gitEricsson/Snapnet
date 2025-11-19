import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1679912345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // departments
    await queryRunner.createTable(
      new Table({
        name: 'department',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // employees
    await queryRunner.createTable(
      new Table({
        name: 'employee',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'department_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'first_name', type: 'varchar', length: '255', isNullable: false },
          { name: 'last_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // leave_request
    await queryRunner.createTable(
      new Table({
        name: 'leave_request',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'employee_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'start_date', type: 'date', isNullable: false },
          { name: 'end_date', type: 'date', isNullable: false },
          { name: 'status', type: 'varchar', length: '50', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // base_user
    await queryRunner.createTable(
      new Table({
        name: 'base_user',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'role', type: 'varchar', length: '50', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // indexes
    await queryRunner.createIndex('employee', new TableIndex({ name: 'IDX_EMP_EMAIL', columnNames: ['email'] }));
    await queryRunner.createIndex('base_user', new TableIndex({ name: 'IDX_USER_EMAIL', columnNames: ['email'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('base_user', 'IDX_USER_EMAIL');
    await queryRunner.dropIndex('employee', 'IDX_EMP_EMAIL');
    await queryRunner.dropTable('base_user');
    await queryRunner.dropTable('leave_request');
    await queryRunner.dropTable('employee');
    await queryRunner.dropTable('department');
  }
}
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1679912345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table (base user)
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '180',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'employee'],
            default: "'employee'",
          },
          {
            name: 'profile_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'profile',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create departments table
    await queryRunner.createTable(
      new Table({
        name: 'departments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create employees table
    await queryRunner.createTable(
      new Table({
        name: 'employees',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'department_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create admin table
    await queryRunner.createTable(
      new Table({
        name: 'admin',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '120',
            isNullable: true,
          },
          {
            name: 'permissions',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create leave_requests table
    await queryRunner.createTable(
      new Table({
        name: 'leave_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'employee_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKeys('employees', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedTableName: 'departments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKey(
      'admin',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex('users', new TableIndex({ name: 'IDX_USER_EMAIL', columnNames: ['email'] }));
    await queryRunner.createIndex('departments', new TableIndex({ name: 'IDX_DEPT_NAME', columnNames: ['name'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'IDX_EMP_USER_ID', columnNames: ['user_id'], isUnique: true }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'IDX_EMP_DEPT', columnNames: ['department_id'] }));
    await queryRunner.createIndex('admin', new TableIndex({ name: 'IDX_ADMIN_USER_ID', columnNames: ['user_id'], isUnique: true }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'IDX_LEAVE_EMP_ID', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'IDX_LEAVE_STATUS', columnNames: ['status'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    const leaveRequestsTable = await queryRunner.getTable('leave_requests');
    const leaveRequestsFk = leaveRequestsTable.foreignKeys.find(fk => fk.columnNames.indexOf('employee_id') !== -1);
    if (leaveRequestsFk) {
      await queryRunner.dropForeignKey('leave_requests', leaveRequestsFk);
    }

    const employeesTable = await queryRunner.getTable('employees');
    const employeeFks = employeesTable.foreignKeys || [];
    for (const fk of employeeFks) {
      await queryRunner.dropForeignKey('employees', fk);
    }

    const adminTable = await queryRunner.getTable('admin');
    const adminFk = adminTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
    if (adminFk) {
      await queryRunner.dropForeignKey('admin', adminFk);
    }

    // Drop tables in reverse order
    await queryRunner.dropTable('leave_requests');
    await queryRunner.dropTable('admin');
    await queryRunner.dropTable('employees');
    await queryRunner.dropTable('departments');
    await queryRunner.dropTable('users');
  }
}
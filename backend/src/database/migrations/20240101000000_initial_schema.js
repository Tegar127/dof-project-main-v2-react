export const up = function (knex) {
    return knex.schema
        // Users Table
        .createTable('users', table => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('email').notNullable().unique();
            table.string('email_verified_at').nullable();
            table.string('password').notNullable();
            table.string('remember_token').nullable();
            table.string('role').defaultTo('user');
            table.string('group_name').nullable();
            table.string('position').nullable();
            table.text('extra_groups').nullable(); // JSON array
            table.timestamps(true, true);
        })

        // Groups Table
        .createTable('groups', table => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.boolean('is_private').defaultTo(false);
            table.timestamps(true, true);
        })

        // Group User pivot
        .createTable('group_user', table => {
            table.integer('group_id').unsigned().references('id').inTable('groups').onDelete('CASCADE');
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.boolean('is_admin').defaultTo(false);
            table.timestamps(true, true);
            table.primary(['group_id', 'user_id']);
        })

        // Folders Table
        .createTable('folders', table => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.integer('parent_id').unsigned().nullable().references('id').inTable('folders').onDelete('CASCADE');
            table.string('type').nullable();
            table.text('metadata').nullable(); // JSON
            table.integer('order').defaultTo(0);
            table.timestamps(true, true);
        })

        // Documents Table
        .createTable('documents', table => {
            table.increments('id').primary();
            table.string('title').notNullable();
            table.string('type').notNullable();
            table.string('status').defaultTo('draft');
            table.integer('author_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('author_name').nullable();
            table.string('target_role').nullable();
            table.string('target_value').nullable();
            table.integer('folder_id').unsigned().nullable().references('id').inTable('folders').onDelete('SET NULL');
            table.string('version').defaultTo('1.0');
            table.integer('approval_count').defaultTo(0);
            table.string('deadline').nullable();
            table.text('content_data').nullable(); // JSON
            table.text('history_log').nullable(); // JSON Array
            table.text('feedback').nullable();
            table.text('forward_note').nullable();
            table.timestamps(true, true);
        })

        // Document Versions
        .createTable('document_versions', table => {
            table.increments('id').primary();
            table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE');
            table.string('version_number').notNullable();
            table.text('content_data').nullable(); // JSON
            table.string('change_summary').nullable();
            table.integer('updated_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.timestamps(true, true);
        })

        // Document Approvals
        .createTable('document_approvals', table => {
            table.increments('id').primary();
            table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE');
            table.integer('sequence').notNullable();
            table.string('approver_position').nullable();
            table.integer('approver_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('status').defaultTo('pending');
            table.text('notes').nullable();
            table.string('approved_at').nullable();
            table.string('approver_name').nullable();
            table.timestamps(true, true);
        })

        // Document Logs
        .createTable('document_logs', table => {
            table.increments('id').primary();
            table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE');
            table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('action').notNullable();
            table.text('details').nullable();
            table.string('old_status').nullable();
            table.string('new_status').nullable();
            table.string('changes_summary').nullable();
            table.timestamps(true, true);
        })

        // Document Read Receipts
        .createTable('document_read_receipts', table => {
            table.increments('id').primary();
            table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE');
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.string('read_at').notNullable();
            table.timestamps(true, true);
            table.unique(['document_id', 'user_id']);
        })

        // Document Distributions
        .createTable('document_distributions', table => {
            table.increments('id').primary();
            table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE');
            table.string('recipient_type').notNullable();
            table.string('recipient_id').nullable();
            table.text('notes').nullable();
            table.timestamps(true, true);
        })

        // Notifications
        .createTable('notifications', table => {
            table.string('id').primary(); // UUID typical
            table.string('type').notNullable();
            table.string('notifiable_type').notNullable();
            table.string('notifiable_id').notNullable();
            table.text('data').notNullable();
            table.string('read_at').nullable();
            table.timestamps(true, true);
        });
};

export const down = function (knex) {
    return knex.schema
        .dropTableIfExists('notifications')
        .dropTableIfExists('document_distributions')
        .dropTableIfExists('document_read_receipts')
        .dropTableIfExists('document_logs')
        .dropTableIfExists('document_approvals')
        .dropTableIfExists('document_versions')
        .dropTableIfExists('documents')
        .dropTableIfExists('folders')
        .dropTableIfExists('group_user')
        .dropTableIfExists('groups')
        .dropTableIfExists('users');
};

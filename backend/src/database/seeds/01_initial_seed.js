import bcrypt from 'bcryptjs';

export const seed = async function (knex) {
    // Disable foreign keys temporarily for clean seeding
    await knex.raw('PRAGMA foreign_keys = OFF');

    // Deletes ALL existing entries in correct order
    await knex('notifications').del();
    await knex('document_distributions').del();
    await knex('document_read_receipts').del();
    await knex('document_logs').del();
    await knex('document_approvals').del();
    await knex('document_versions').del();
    await knex('documents').del();
    await knex('folders').del();
    await knex('group_user').del();
    await knex('groups').del();
    await knex('users').del();

    // Reset auto-increment counters
    await knex.raw("DELETE FROM sqlite_sequence WHERE name IN ('users', 'groups', 'group_user', 'folders', 'documents')");

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const passwordHash = await bcrypt.hash('123', 10);

    // Re-enable foreign keys
    await knex.raw('PRAGMA foreign_keys = ON');

    // Insert groups first (Primary Groups / Divisi)
    const groupNames = [
        'Sekretariat Perusahaan',
        'Divisi Kepatuhan dan Hukum',
        'Divisi Strategi SDM',
        'Divisi Kepesertaan',
        'Divisi Pelayanan',
        'Divisi Sistem Informasi',
        'Divisi Umum & Personalia',
        'Divisi Pelatihan dan Pengembangan',
    ];

    const groupIds = {};
    for (const name of groupNames) {
        const [id] = await knex('groups').insert({ name, created_at: now, updated_at: now });
        groupIds[name] = id;
    }

    // Insert users and assign to groups
    const [adminId] = await knex('users').insert({
        name: 'Administrator',
        email: 'admin@dof.test',
        password: passwordHash,
        role: 'admin',
        position: 'direksi',
        group_name: 'Sekretariat Perusahaan',
        created_at: now,
        updated_at: now
    });

    const [direksiId] = await knex('users').insert({
        name: 'User Direksi',
        email: 'direksi@dof.test',
        password: passwordHash,
        role: 'user',
        position: 'direksi',
        group_name: 'Divisi Sistem Informasi',
        created_at: now,
        updated_at: now
    });

    const [reviewerId] = await knex('users').insert({
        name: 'Reviewer Disposisi',
        email: 'reviewer@dof.test',
        password: passwordHash,
        role: 'reviewer',
        position: 'reviewer',
        group_name: 'Sekretariat Perusahaan',
        created_at: now,
        updated_at: now
    });

    const [kadivId] = await knex('users').insert({
        name: 'User Kadiv',
        email: 'kadiv@dof.test',
        password: passwordHash,
        role: 'user',
        position: 'kadiv',
        group_name: 'Divisi Strategi SDM',
        created_at: now,
        updated_at: now
    });

    // Pivot table — link users to their primary group
    await knex('group_user').insert([
        { group_id: groupIds['Sekretariat Perusahaan'], user_id: adminId, is_admin: true, created_at: now, updated_at: now },
        { group_id: groupIds['Divisi Sistem Informasi'], user_id: direksiId, is_admin: false, created_at: now, updated_at: now },
        { group_id: groupIds['Divisi Strategi SDM'], user_id: kadivId, is_admin: false, created_at: now, updated_at: now },
    ]);
};

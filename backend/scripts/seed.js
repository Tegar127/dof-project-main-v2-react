/**
 * seed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed database PostgreSQL via Prisma Client.
 * Menghapus semua data existing dan mengisi ulang dengan data awal.
 *
 * Cara pakai:
 *   npm run seed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Hapus data dalam urutan FK yang aman ────────────────────────────────
    await prisma.notification.deleteMany();
    await prisma.documentDistribution.deleteMany();
    await prisma.documentReadReceipt.deleteMany();
    await prisma.documentLog.deleteMany();
    await prisma.documentApproval.deleteMany();
    await prisma.documentVersion.deleteMany();
    await prisma.document.deleteMany();
    await prisma.folder.deleteMany();
    await prisma.groupUser.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    console.log('  ✓ Cleared existing data.');

    // ── Reset sequences ─────────────────────────────────────────────────────
    const seqTables = [
        'users', 'groups', 'folders', 'documents',
        'document_versions', 'document_approvals', 'document_logs',
        'document_read_receipts', 'document_distributions'
    ];
    for (const table of seqTables) {
        await prisma.$executeRawUnsafe(
            `ALTER SEQUENCE IF EXISTS "${table}_id_seq" RESTART WITH 1`
        );
    }
    console.log('  ✓ Reset sequences.');

    const passwordHash = await bcrypt.hash('123', 10);

    // ── Insert Groups ───────────────────────────────────────────────────────
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

    const groupMap = {};
    for (const name of groupNames) {
        const group = await prisma.group.create({ data: { name } });
        groupMap[name] = group.id;
    }
    console.log(`  ✓ Created ${groupNames.length} groups.`);

    // ── Insert Users ────────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            name: 'Administrator',
            email: 'admin@dof.test',
            password: passwordHash,
            role: 'admin',
            position: 'direksi',
            group_name: 'Sekretariat Perusahaan'
        }
    });

    const direksi = await prisma.user.create({
        data: {
            name: 'User Direksi',
            email: 'direksi@dof.test',
            password: passwordHash,
            role: 'user',
            position: 'direksi',
            group_name: 'Divisi Sistem Informasi'
        }
    });

    const reviewer = await prisma.user.create({
        data: {
            name: 'Reviewer Disposisi',
            email: 'reviewer@dof.test',
            password: passwordHash,
            role: 'reviewer',
            position: 'reviewer',
            group_name: 'Sekretariat Perusahaan'
        }
    });

    const kadiv = await prisma.user.create({
        data: {
            name: 'User Kadiv',
            email: 'kadiv@dof.test',
            password: passwordHash,
            role: 'user',
            position: 'kadiv',
            group_name: 'Divisi Strategi SDM'
        }
    });

    console.log('  ✓ Created 4 users.');

    // ── Link Users → Groups ─────────────────────────────────────────────────
    await prisma.groupUser.createMany({
        data: [
            { group_id: groupMap['Sekretariat Perusahaan'], user_id: admin.id, is_admin: true },
            { group_id: groupMap['Divisi Sistem Informasi'], user_id: direksi.id, is_admin: false },
            { group_id: groupMap['Divisi Strategi SDM'], user_id: kadiv.id, is_admin: false }
        ]
    });
    console.log('  ✓ Linked users to groups.');

    console.log('\n✅ Seeding complete!');
    console.log('   admin@dof.test    | role: admin    | pass: 123');
    console.log('   direksi@dof.test  | role: user     | pass: 123');
    console.log('   reviewer@dof.test | role: reviewer | pass: 123');
    console.log('   kadiv@dof.test    | role: user     | pass: 123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

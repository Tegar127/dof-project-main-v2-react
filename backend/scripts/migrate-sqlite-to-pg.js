/**
 * migrate-sqlite-to-pg.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script migrasi data dari SQLite ke PostgreSQL.
 *
 * Fitur:
 *   - Backup file SQLite sebelum proses
 *   - Buat tabel di PostgreSQL jika belum ada (CREATE TABLE IF NOT EXISTS)
 *   - Upsert semua data (INSERT ... ON CONFLICT DO UPDATE) berdasarkan PK
 *   - Konversi boolean SQLite (0/1) → PostgreSQL (true/false)
 *   - Reset sequences PostgreSQL setelah import
 *   - Validasi row count: SQLite vs PostgreSQL
 *
 * Cara pakai:
 *   1. Pastikan DATABASE_URL di .env sudah diisi dengan koneksi PostgreSQL
 *   2. node scripts/migrate-sqlite-to-pg.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Database from 'better-sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQLITE_PATH = path.resolve(__dirname, '../../database/database.sqlite');
const BACKUP_PATH = path.resolve(__dirname, '../../database/database.sqlite.bak');

// ─── Util ─────────────────────────────────────────────────────────────────────

const log = {
    info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m  ${msg}`),
    ok: (msg) => console.log(`\x1b[32m[OK]\x1b[0m    ${msg}`),
    warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m  ${msg}`),
    error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`)
};

// Konversi nilai boolean SQLite (0/1/null) → PostgreSQL boolean
const toBool = (val) => {
    if (val === null || val === undefined) return null;
    return Boolean(val);
};

// Urutan tabel sesuai FK (parent dulu)
const TABLE_ORDER = [
    'users',
    'groups',
    'group_user',
    'folders',
    'documents',
    'document_versions',
    'document_approvals',
    'document_logs',
    'document_read_receipts',
    'document_distributions',
    'notifications'
];

// Kolom boolean per tabel (SQLite simpan sebagai 0/1)
const BOOLEAN_COLUMNS = {
    users: [],
    groups: ['is_private'],
    group_user: ['is_admin'],
    folders: [],
    documents: [],
    document_versions: [],
    document_approvals: [],
    document_logs: [],
    document_read_receipts: [],
    document_distributions: [],
    notifications: []
};

// ─── DDL: CREATE TABLE IF NOT EXISTS ──────────────────────────────────────────

const DDL = {
    users: `
        CREATE TABLE IF NOT EXISTS users (
            id               SERIAL PRIMARY KEY,
            name             VARCHAR(255) NOT NULL,
            email            VARCHAR(255) NOT NULL UNIQUE,
            email_verified_at VARCHAR(255),
            password         VARCHAR(255) NOT NULL,
            remember_token   VARCHAR(255),
            role             VARCHAR(255) NOT NULL DEFAULT 'user',
            group_name       VARCHAR(255),
            position         VARCHAR(255),
            extra_groups     TEXT,
            created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    groups: `
        CREATE TABLE IF NOT EXISTS groups (
            id         SERIAL PRIMARY KEY,
            name       VARCHAR(255) NOT NULL,
            is_private BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    group_user: `
        CREATE TABLE IF NOT EXISTS group_user (
            group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
            user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
            is_admin   BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (group_id, user_id)
        )`,
    folders: `
        CREATE TABLE IF NOT EXISTS folders (
            id         SERIAL PRIMARY KEY,
            name       VARCHAR(255) NOT NULL,
            parent_id  INTEGER REFERENCES folders(id) ON DELETE CASCADE,
            type       VARCHAR(255),
            metadata   TEXT,
            "order"    INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    documents: `
        CREATE TABLE IF NOT EXISTS documents (
            id             SERIAL PRIMARY KEY,
            title          VARCHAR(255) NOT NULL,
            type           VARCHAR(255) NOT NULL,
            status         VARCHAR(255) NOT NULL DEFAULT 'draft',
            author_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
            author_name    VARCHAR(255),
            target_role    VARCHAR(255),
            target_value   VARCHAR(255),
            folder_id      INTEGER REFERENCES folders(id) ON DELETE SET NULL,
            version        VARCHAR(255) NOT NULL DEFAULT '1.0',
            approval_count INTEGER NOT NULL DEFAULT 0,
            deadline       VARCHAR(255),
            content_data   TEXT,
            history_log    TEXT,
            feedback       TEXT,
            forward_note   TEXT,
            created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    document_versions: `
        CREATE TABLE IF NOT EXISTS document_versions (
            id             SERIAL PRIMARY KEY,
            document_id    INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            version_number VARCHAR(255) NOT NULL,
            content_data   TEXT,
            change_summary VARCHAR(255),
            updated_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    document_approvals: `
        CREATE TABLE IF NOT EXISTS document_approvals (
            id                SERIAL PRIMARY KEY,
            document_id       INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            sequence          INTEGER NOT NULL,
            approver_position VARCHAR(255),
            approver_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
            status            VARCHAR(255) NOT NULL DEFAULT 'pending',
            notes             TEXT,
            approved_at       VARCHAR(255),
            approver_name     VARCHAR(255),
            created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    document_logs: `
        CREATE TABLE IF NOT EXISTS document_logs (
            id              SERIAL PRIMARY KEY,
            document_id     INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action          VARCHAR(255) NOT NULL,
            details         TEXT,
            old_status      VARCHAR(255),
            new_status      VARCHAR(255),
            changes_summary VARCHAR(255),
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    document_read_receipts: `
        CREATE TABLE IF NOT EXISTS document_read_receipts (
            id          SERIAL PRIMARY KEY,
            document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            user_id     INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
            read_at     VARCHAR(255) NOT NULL,
            created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE (document_id, user_id)
        )`,
    document_distributions: `
        CREATE TABLE IF NOT EXISTS document_distributions (
            id             SERIAL PRIMARY KEY,
            document_id    INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            recipient_type VARCHAR(255) NOT NULL,
            recipient_id   VARCHAR(255),
            notes          TEXT,
            created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
    notifications: `
        CREATE TABLE IF NOT EXISTS notifications (
            id              TEXT PRIMARY KEY,
            type            VARCHAR(255) NOT NULL,
            notifiable_type VARCHAR(255) NOT NULL,
            notifiable_id   VARCHAR(255) NOT NULL,
            data            TEXT NOT NULL,
            read_at         VARCHAR(255),
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
        )`
};

// Tabel yang tidak memiliki kolom id SERIAL (composite PK atau text PK)
const NO_SERIAL_TABLES = new Set(['group_user', 'notifications']);

// ─── Upsert Logic ─────────────────────────────────────────────────────────────

/**
 * Membangun query INSERT ... ON CONFLICT DO UPDATE untuk upsert aman.
 * Untuk group_user (composite PK): ON CONFLICT (group_id, user_id)
 * Untuk notifications (text PK):   ON CONFLICT (id)
 * Untuk tabel lain (SERIAL PK):    ON CONFLICT (id)
 */
const buildUpsertQuery = (tableName, columns) => {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const colNames = columns.map((c) => `"${c}"`).join(', ');

    let conflictTarget;
    if (tableName === 'group_user') {
        conflictTarget = '(group_id, user_id)';
    } else {
        conflictTarget = '(id)';
    }

    const updateSet = columns
        .filter((c) => c !== 'id' && !(tableName === 'group_user' && (c === 'group_id' || c === 'user_id')))
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .join(', ');

    return `
        INSERT INTO "${tableName}" (${colNames})
        VALUES (${placeholders})
        ON CONFLICT ${conflictTarget} DO UPDATE SET ${updateSet}
    `;
};

// ─── Reset Sequences ──────────────────────────────────────────────────────────

const SEQUENCE_TABLES = TABLE_ORDER.filter((t) => !NO_SERIAL_TABLES.has(t));

const resetSequences = async (pgClient) => {
    log.info('Resetting PostgreSQL sequences...');
    for (const table of SEQUENCE_TABLES) {
        const res = await pgClient.query(`SELECT MAX(id) FROM "${table}"`);
        const maxId = res.rows[0].max;
        if (!maxId) {
            log.warn(`  Sequence "${table}_id_seq" skipped (table is empty).`);
            continue;
        }
        await pgClient.query(
            `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), $1, true)`,
            [maxId]
        );
        log.ok(`  Sequence "${table}_id_seq" reset to ${maxId}`);
    }
};

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
    // 1. Backup SQLite
    log.info(`Backing up SQLite: ${SQLITE_PATH} → ${BACKUP_PATH}`);
    if (!fs.existsSync(SQLITE_PATH)) {
        log.error(`SQLite file not found: ${SQLITE_PATH}`);
        process.exit(1);
    }
    fs.copyFileSync(SQLITE_PATH, BACKUP_PATH);
    log.ok('SQLite backup created.');

    // 2. Connect SQLite
    const sqlite = new Database(SQLITE_PATH, { readonly: true });
    log.ok('Connected to SQLite.');

    // 3. Connect PostgreSQL
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) {
        log.error('DATABASE_URL di .env belum dikonfigurasi. Ganti USER, PASSWORD, HOST, dan DATABASE terlebih dahulu.');
        process.exit(1);
    }

    const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const pgClient = await pgPool.connect();
    log.ok('Connected to PostgreSQL.');

    try {
        // 4. Buat tabel jika belum ada
        log.info('Creating tables (IF NOT EXISTS)...');
        await pgClient.query('BEGIN');
        for (const table of TABLE_ORDER) {
            await pgClient.query(DDL[table]);
            log.ok(`  Table "${table}" ready.`);
        }
        await pgClient.query('COMMIT');

        // 5. Disable FK checks sementara di PostgreSQL
        await pgClient.query('SET session_replication_role = replica');

        const summary = [];

        // 6. Migrate data per tabel
        for (const table of TABLE_ORDER) {
            const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
            const sqliteCount = rows.length;

            if (sqliteCount === 0) {
                log.warn(`  "${table}": 0 rows in SQLite, skipping.`);
                summary.push({ table, sqlite: 0, pg: 0, match: true });
                continue;
            }

            log.info(`Migrating "${table}" (${sqliteCount} rows)...`);

            const columns = Object.keys(rows[0]);
            const boolCols = new Set(BOOLEAN_COLUMNS[table] || []);
            const upsertSql = buildUpsertQuery(table, columns);

            let upserted = 0;
            for (const row of rows) {
                const values = columns.map((col) => {
                    let val = row[col];
                    if (boolCols.has(col)) val = toBool(val);
                    // Konversi timestamp string ke Date agar pg driver handle dengan benar
                    if ((col === 'created_at' || col === 'updated_at') && typeof val === 'string') {
                        val = new Date(val.replace(' ', 'T'));
                    }
                    return val;
                });

                await pgClient.query(upsertSql, values);
                upserted++;
            }

            // Hitung row di PG setelah upsert
            const pgRes = await pgClient.query(`SELECT COUNT(*) FROM "${table}"`);
            const pgCount = parseInt(pgRes.rows[0].count, 10);
            const match = pgCount >= sqliteCount;

            summary.push({ table, sqlite: sqliteCount, pg: pgCount, match });
            log.ok(`  "${table}": ${upserted} rows upserted → PG total: ${pgCount}`);
        }

        // 7. Re-enable FK checks
        await pgClient.query('SET session_replication_role = DEFAULT');

        // 8. Reset sequences
        await resetSequences(pgClient);

        // 9. Validasi & laporan ringkasan
        console.log('\n');
        console.log('═'.repeat(65));
        console.log(' MIGRATION SUMMARY');
        console.log('═'.repeat(65));
        console.log(
            'Table'.padEnd(30) +
            'SQLite'.padStart(8) +
            'PostgreSQL'.padStart(12) +
            'Match'.padStart(8)
        );
        console.log('─'.repeat(65));
        for (const row of summary) {
            const matchIcon = row.match ? '✅' : '❌';
            console.log(
                row.table.padEnd(30) +
                String(row.sqlite).padStart(8) +
                String(row.pg).padStart(12) +
                `  ${matchIcon}`.padStart(8)
            );
        }
        console.log('═'.repeat(65));

        const allMatch = summary.every((r) => r.match);
        if (allMatch) {
            log.ok('\n✅ Migration completed successfully! All row counts match.');
        } else {
            log.warn('\n⚠️  Migration completed with discrepancies. Check the table(s) marked ❌ above.');
        }
    } catch (err) {
        await pgClient.query('ROLLBACK').catch(() => { });
        log.error(`Migration failed: ${err.message}`);
        console.error(err);
        process.exit(1);
    } finally {
        pgClient.release();
        await pgPool.end();
        sqlite.close();
    }
})();

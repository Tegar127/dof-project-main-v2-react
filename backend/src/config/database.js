import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the db path is resolved relative to the backend root where it's executed
// In env, frontendUrl, and dbFilename is DB_FILENAME=../database/database.sqlite
// The process will run in /backend so it should be resolved accordingly
const dbPath = path.resolve(process.cwd(), config.dbFilename);

const db = knex({
    client: config.dbClient,
    connection: {
        filename: dbPath
    },
    useNullAsDefault: true,
    pool: {
        afterCreate: (conn, cb) => {
            try {
                conn.pragma('foreign_keys = ON');
            } catch (e) {
                // Silently ignore if pragma fails
            }
            cb();
        }
    }
});

export default db;

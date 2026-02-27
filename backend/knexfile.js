import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    development: {
        client: 'better-sqlite3',
        connection: {
            filename: path.resolve(__dirname, './database/database.sqlite')
        },
        useNullAsDefault: true,
        migrations: {
            directory: './src/database/migrations'
        },
        seeds: {
            directory: './src/database/seeds'
        }
    },
    production: {
        client: 'better-sqlite3',
        connection: {
            filename: path.resolve(__dirname, './database/database.sqlite')
        },
        useNullAsDefault: true,
        migrations: {
            directory: './src/database/migrations'
        },
        seeds: {
            directory: './src/database/seeds'
        }
    }
};

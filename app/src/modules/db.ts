import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import logger from './logger';

if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not defined');
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const adapter = new PrismaPg(pool);

const db = new PrismaClient({ adapter }).$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                try {
                    return await query(args);
                } catch (error) {
                    const data = error as Prisma.PrismaClientUnknownRequestError;
                    data.message
                    logger.error(data.message, "Database");
                    return;
                }
            },
        },
    },
});

export default db;
import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import logger from './logger';

const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });
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
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import logger from './logger';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const db = new PrismaClient({ adapter }).$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }: any) {
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
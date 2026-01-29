import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import logger from './logger';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const db = new PrismaClient({
    adapter,
    log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' },
    ],
});

// Set up logging for Prisma events
db.$on('warn', (e: Prisma.LogEvent) => {
    e.target
    logger.warn(e.message, "Database");
});

db.$on('info', (e: Prisma.LogEvent) => {
    logger.info(e.message, "Database");
});

db.$on('error', (e: Prisma.LogEvent) => {
    logger.error(e.message, "Database");
});

db.$on('query', (e: Prisma.QueryEvent) => {
    logger.debug(`Prisma query: ${e.query} (params: ${e.params}) - took ${e.duration}ms`, "Database");
});

export default db;
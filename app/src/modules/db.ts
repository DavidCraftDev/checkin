import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import logger from './logger';
import { config_data } from './data/config';

// Initialize PostgreSQL prisma client
const connectionString = config_data.POSTGRES_URL;

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

// Ensure a single instance of PrismaClient in development
const globalForPrisma = global as unknown as { prisma: typeof db }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Export types
export type { PrismaClient, Prisma };
export type Attendances = Prisma.AttendancesModel
export type Events = Prisma.EventsModel
export type StudyTimeData = Prisma.StudyTimeDataModel
export type User = Prisma.UserModel
export type Session = Prisma.SessionModel
export type ClosedStudyTimes = Prisma.ClosedStudyTimesModel

export default db;
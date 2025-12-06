import { Prisma, PrismaClient } from '@prisma/client';
import logger from './logger';

const db = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                try {
                    return await query(args);
                } catch (error) {
                    const data = error as Prisma.PrismaClientUnknownRequestError;
                    logger.error(data.message, "Database");
                    // Re-throw the error instead of returning undefined
                    // This ensures errors are properly propagated and handled
                    throw error;
                }
            },
        },
    },
});

export default db;
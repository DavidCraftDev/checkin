import "server-only";

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
                    data.message
                    logger.error(data.message, "Database");
                    return;
                }
            },
        },
    },
});

export default db;
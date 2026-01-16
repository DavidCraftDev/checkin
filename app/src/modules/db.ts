// 🗄️ DATABASE MODULE! The keeper of all the data! 👑
import { Prisma, PrismaClient } from '@prisma/client'; // 🎯 Prisma imports for database wizardry!
import logger from './logger'; // 📝 Logger for when things go sideways! 🎢

// 🎪 Creating a super-powered Prisma client with error handling! 💪
const db = new PrismaClient().$extends({
    query: {
        $allModels: { // 🏰 Applies to ALL models! Universal error handling FTW! 🌍
            async $allOperations({ model, operation, args, query }) {
                try {
                    return await query(args); // 🎯 Execute the query! Fingers crossed! 🤞
                } catch (error) {
                    // 💥 Oh no! Something exploded! Let's log it! 📋
                    const data = error as Prisma.PrismaClientUnknownRequestError;
                    data.message // 📨 The error message!
                    logger.error(data.message, "Database"); // 🚨 Log that error for posterity!
                    return; // 🏃 Return gracefully (or as gracefully as an error can be!)
                }
            },
        },
    },
});

export default db; // 🎁 Export our enhanced database client! Use it wisely! 🧙‍♂️
import logger from "@/app/src/modules/logger";
import { PrismaClient } from "@prisma/client";

export async function cleanUpData(prisma: PrismaClient) {
    logger.info("Running cleanup script", "Seed")
    prisma.session.deleteMany({
        where: {
            expiresAt: {
                lte: new Date()
            }
        }
    })

    prisma.attendances.deleteMany({
        where: {
            AND: [
                { eventID: "NOTE" },
                {
                    created_at: {
                        lte: new Date(new Date().getTime() - 60000)
                    }
                },
                {
                    OR: [
                        { type: null },
                        { studentNote: null }
                    ]
                }
            ]
        }
    })

    prisma.events.deleteMany({
        where: {
            AND: [
                {
                    id: {
                        notIn: (await prisma.attendances.findMany({
                            select: {
                                eventID: true
                            }
                        })).map(attendance => attendance.eventID)
                    }
                },
                {
                    created_at: {
                        lte: new Date(new Date().getTime() - 3600000)
                    }
                }
            ]
        }
    })
    logger.info("Cleanup script completed", "Seed")
    return
}
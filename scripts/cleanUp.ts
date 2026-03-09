import { PrismaClient } from "@/app/src/modules/db";
import logger from "@/app/src/modules/logger";

export async function cleanUpData(prisma: PrismaClient) {
    logger.info("Das Reinigungsritual beginnt — die alten Akten zittern", "Seed")
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
    logger.info("Das Reinigungsritual ist vollendet — Ordnung kehrt ein, vorübergehend", "Seed")
    return
}
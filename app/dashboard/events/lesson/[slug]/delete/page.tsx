import db from "@/app/src/modules/db";
import logger from "@/app/src/modules/logger";
import { notFound, redirect } from "next/navigation";

export default async function deleteLesson({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!slug) return notFound();
    await db.attendances.deleteMany({
        where: {
            eventID: slug
        },
    });
    await db.events.delete({
        where: {
            id: slug
        },
    });
    logger.info("Der Unterricht mit der Akte " + slug + " wurde aus der Existenz gestrichen", "Lesson");
    redirect("/dashboard");
    return (<></>);
}
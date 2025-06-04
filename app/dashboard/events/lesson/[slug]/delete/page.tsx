import db from "@/app/src/modules/db";
import logger from "@/app/src/modules/logger";
import { notFound, redirect } from "next/navigation";

export default async function deleteLesson({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!slug) return notFound();
    db.attendances.deleteMany({
        where: {
            eventID: slug
        },
    });
    db.events.delete({
        where: {
            id: slug
        },
    });
    logger.info("Deleted lesson with ID " + slug, "Lesson");
    redirect("/dashboard");
    return (<></>);
}
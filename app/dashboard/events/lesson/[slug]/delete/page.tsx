import db from "@/lib/db";
import logger from "@/lib/logger";
import { notFound, redirect } from "next/navigation";

export default async function deleteLesson({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!slug) return notFound();
    await db.attendance.deleteMany({
        where: {
            eventID: slug
        },
    });
    await db.event.delete({
        where: {
            id: slug
        },
    });
    logger.info("Deleted lesson with ID " + slug, "Lesson");
    redirect("/dashboard");
    return (<></>);
}
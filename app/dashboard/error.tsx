"use client";

import CalendarWeek from "../src/ui/calendarweek";
import CalendarWeekRange from "../src/ui/calendarweekRange";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isWeekPage = pathname.includes("/events/attendedEvents") || pathname.includes("/groups/group") || pathname.includes("/courses/");
    const isRangePage = pathname.includes("/overview/user") || pathname.includes("/overview/group");

    const hasWeekParams = (searchParams.has("cw") || searchParams.has("year")) && isWeekPage;
    const hasRangeParams = (searchParams.has("startCW") || searchParams.has("startYear") || searchParams.has("endCW") || searchParams.has("endYear")) && isRangePage;

    return (
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1>
            <button onClick={reset} className="btn">Erneut versuchen</button>
            <p className="mt-2">{error.message || "Unbekannter Fehler"}</p>
            {hasWeekParams && (
                <div className="mt-4">
                    <p className="font-bold">Woche ändern:</p>
                    <CalendarWeek />
                </div>
            )}
            {hasRangeParams && (
                <div className="mt-4">
                    <p className="font-bold">Zeitraum ändern:</p>
                    <div className="flex gap-4">
                        <CalendarWeekRange />
                    </div>
                </div>
            )}
        </div>
    );
}

function ErrorComponent(props: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <Suspense fallback={<div>Laden...</div>}>
            <ErrorContent {...props} />
        </Suspense>
    );
}

export default ErrorComponent;
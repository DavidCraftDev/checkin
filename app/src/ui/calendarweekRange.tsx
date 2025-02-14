"use client";

import CalendarWeek from "./calendarweek";

function CalendarWeekRange() {
    return (
        <>
            <div>
                <p className="text-center font-bold">Startwoche</p>
                <CalendarWeek cwSearchParam="startCW" yearSearchParam="startYear" />
            </div>
            <div>
                <p className="text-center font-bold">Endwoche</p>
                <CalendarWeek cwSearchParam="endCW" yearSearchParam="endYear" />
            </div>
        </>
    )
}

export default CalendarWeekRange;
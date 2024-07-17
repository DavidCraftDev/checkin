"use client";

interface AttendedStudyTimesProps {
    studyTimeData: {
        normal: number,
        parallel: number,
        noted: number,
        needed: number
    }
}


function AttendedStudyTimes(props: AttendedStudyTimesProps) {
    let studyTimeData = props.studyTimeData
    let noted = studyTimeData.noted
    let parallel = studyTimeData.parallel
    let totalAttended = studyTimeData.normal + studyTimeData.parallel + studyTimeData.noted
    let needed = studyTimeData.needed
    return (
        <span>
            {noted !== 0 ? <span className={"text-orange-600"}>!{noted} </span> : null}
            {parallel !== 0 ? <span>!{parallel} </span> : null}
            {totalAttended}/{needed}
        </span>
    )
}

export default AttendedStudyTimes;
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
    let normal = studyTimeData.normal || 0
    let noted = studyTimeData.noted || 0
    let parallel = studyTimeData.parallel || 0
    let totalAttended = normal + parallel + noted
    let needed = studyTimeData.needed || 0
    return (
        <span>
            {noted !== 0 ? <span className={"text-orange-600"}>!{noted} </span> : null}
            {parallel !== 0 ? <span>!{parallel} </span> : null}
            {totalAttended}/{needed}
        </span>
    )
}

export default AttendedStudyTimes;
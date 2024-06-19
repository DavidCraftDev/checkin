"use client";

function AttendedStudyTimes(props: any) {
    let studyTimeData = props.studyTimeData
    let noted = studyTimeData.noted
    let parallel = studyTimeData.parallel
    let together = studyTimeData.normal + studyTimeData.parallel + studyTimeData.noted
    let needed = studyTimeData.needed
    return (
        <span>
            {noted !== 0 ? <span className={"text-orange-600"}>!{noted} </span> : null}
            {parallel !== 0 ? <span>!{parallel} </span> : null}
            {together}/{needed}
        </span>
    )
}

export default AttendedStudyTimes;
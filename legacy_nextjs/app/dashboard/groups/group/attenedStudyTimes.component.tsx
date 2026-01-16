interface AttendedStudyTimesProps {
    studyTimeData: {
        normal: number,
        parallel: number,
        noted: number,
        needed: number
    }
}

function AttendedStudyTimes(props: AttendedStudyTimesProps) {
    const studyTimeData = props.studyTimeData;
    const normal = studyTimeData.normal || 0;
    const noted = studyTimeData.noted || 0;
    const parallel = studyTimeData.parallel || 0;
    const totalAttended = normal + parallel + noted;
    const needed = studyTimeData.needed || 0;
    return (
        <span>
            {noted !== 0 ? <span className="text-orange-600">!{noted} </span> : null}
            {parallel !== 0 ? <span>!{parallel} </span> : null}
            {totalAttended}/{needed}
        </span>
    )
}

export default AttendedStudyTimes;
import { getSesession } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import moment from "moment";

type SearchParams = {
    cw: number;
    year: number;
    userID: string;
  };

export default async function attendedEvents({searchParams}: {searchParams: SearchParams}) {
    const session = await getSesession();
    const currentWeek = moment().week();
    const currentYear = moment().year();

    const cw = searchParams.cw || currentWeek;
    const year = searchParams.year || currentYear;
    const userID = searchParams.userID || session.user.id;
    const data = await getAttendancesPerUser(userID, cw, year);
    return (
        <div>
            <h1>Teilgenomme Veranstalltungen</h1>
            <p>von { session.user.name }</p>
            <div className="flex">
               <button className="btn">+</button>
               <div className="grid grid-cols-1 grid-rows-2 gap-0 justify-center items-center">
                    <p>{year}</p>
                    <p className="text-4xl text-bold">{cw}</p>
               </div>
              <button className="btn text-bold">-</button>
            </div> 
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Lehrer</th>
                        <th>Zeit</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((event) => (
                    <tr key={event.attendance.id}>
                        <td>{event.event.name}</td>
                        <td>{event.eventUser.displayname}</td>
                        <td>{moment(Date.parse(event.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
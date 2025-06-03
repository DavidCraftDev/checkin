"use client";
import { useRouter } from "next/navigation";
import { resetRoundCounts, RoundResponse } from "./handler";

export function SponsorenlaufTable(props: { data: RoundResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Teilnehmer</th>
              <th>Runden</th>
            </tr>
          </thead>
          <tbody>
            {props.data.map((item) => (
              <tr key={item.displayName}>
                <td>{item.displayName}</td>
                <td>{item.roundCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {props.data.length === 0 ? <p className="text-center italic m-2">Keine Runden gelaufen</p> : null}
      </div>
    </div>
  )
}

export function ResetButton() {
  const router = useRouter();
  async function resetDataHandler() {
    if (!confirm("Bist du sicher, dass du die Daten zurücksetzen möchtest? Dies kann nicht rückgängig gemacht werden!")) return;
    await resetRoundCounts();
    router.refresh();
  }
  return (
    <div className={"btnWarning flex justify-center items-center"}>
      <button onClick={resetDataHandler} className="btn w-max h-min mt-2 md:mt-0">Daten zurücksetzen</button>
    </div>
  )
}
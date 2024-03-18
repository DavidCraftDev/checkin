"use client";
import {useSearchParams, useRouter} from "next/navigation";
import CheckinForm from "./checkinForm.component";
import { getUserPerID } from "@/app/src/modules/userUtilities";

async function CreateCheckinModal() {
    const searchParams = useSearchParams();
    const modal = searchParams.get("checkin");
    const router = useRouter();
    const feedback = searchParams.get("result") || "";
    let error = false;
    let errorMessage = "";
    let success = false;
    let successMessage = "";
    if(feedback === "ErrorNotFound") {
        error = true;
        errorMessage = "Nutzer nicht gefunden";
    }
    if(feedback === "ErrorAlreadyCheckedIn") {
        error = true;
        errorMessage = "Nutzer bereits eingetragen";
    }
    if(feedback === "ErrorEventNotFound") {
        error = true;
        errorMessage = "Event nicht gefunden";
    }
    if(feedback.startsWith("Success")) {
        success = true;
        let user = "Nutzer" //await getUserPerID(feedback.replace("Success", ""));
        successMessage = user + " erfolgreich eingetragen";
    }

    return (
        <>
            {modal &&
                <dialog
                    className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md">
                        <div className="flex flex-col items-center">
                            <h1>Nutzer hinzufügen</h1>
                            {error ? <p className="bg-red-700 text-white">{errorMessage}</p> : null}
                            {success ? <p className="bg-green-700 text-white">{successMessage}</p> : null}
                            <br/>
                            <CheckinForm/>
                            <button onClick={() => { router.push("/dashboard/events/event?id=" + searchParams.get("id")) }}>Zurück</button>
                        </div>
                    </div>
                </dialog>
            }
        </>
    );
}

export default CreateCheckinModal;
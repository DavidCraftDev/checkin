"use client";
import {useSearchParams, useRouter} from "next/navigation";
import EventForm from "./createEventForm.component";

function CreateEventModal() {
    const searchParams = useSearchParams();
    const modal = searchParams.get("create");
    const router = useRouter();

    return (
        <>
            {modal &&
                <dialog
                    className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md">
                        <div className="flex flex-col items-center">
                            <h1>Event Erstellen</h1>
                            <br/>
                            <EventForm/>
                            <button onClick={() => { router.back() }}>Zurück</button>
                        </div>
                    </div>
                </dialog>
            }
        </>
    );
}

export default CreateEventModal;
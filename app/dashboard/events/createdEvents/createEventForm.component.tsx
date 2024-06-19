"use client";

import { useState } from "react";
import submitHandler from "./submitHandler";

function CreateEventForm(props: any) {
    const [type, setType] = useState("");
    return (
        <form action={submitHandler}>
            <div>
                <label htmlFor="eventName">Veranstaltungsname</label><br />
                <input type="text" name="eventName" id="eventName" className="rounded-full p-2 my-2 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                <input type="hidden" name="type" value={type} />
            </div>
            <button type="submit" className="btn mb-1 md:mr-1 md:mb-0" onClick={() => setType("event")}>Veranstaltung Erstellen</button>
            {props.studyTime ? <button type="submit" className="btn" onClick={() => setType("studyTime")}>Studienzeit Erstellen</button> : null}
        </form>
    )
}

export default CreateEventForm;
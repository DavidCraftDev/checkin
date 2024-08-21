"use client";

import { User } from "@prisma/client";
import { submitHandlerEvent, submitHandlerStudyTime } from "./submitHandler";
import { FormEvent } from "react";

interface CreatedEventFormProps {
    studyTime: boolean,
    user: User
}

function CreateEventForm(props: CreatedEventFormProps) {
    async function handlerEvent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        submitHandlerEvent(formData.get("eventName") as string);
    }
    async function handlerStudyTime(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        submitHandlerStudyTime(formData.get("studyTime") as string);
    }
    let competences: Array<string> = props.user.competence as Array<string>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1">
            {props.studyTime && props.user.competence ? (
                <form onSubmit={handlerStudyTime}>
                    <div>
                        <label htmlFor="studyTime">Studienzeit</label><br />
                        <select defaultValue="default" id="studyTime" name="studyTime" className="rounded-full p-2 my-2 border-2 ring-0 ring-black focus:outline-none focus:ring-1">
                            <option disabled value="default">Studienzeit wählen</option>
                            {competences.map((competence: string) => (
                                <option key={competence} value={competence}>{competence}</option>
                            ))}
                            <option value="parallel">Vertretung</option>
                        </select> <br />
                        <button type="submit" className="btn" >Studienzeit Erstellen</button>
                    </div>
                </form>) : null}
            <form onSubmit={handlerEvent}>
                <div>
                    <label htmlFor="eventName">Veranstaltungsname</label><br />
                    <input type="text" name="eventName" id="eventName" className="rounded-full p-2 my-2 border-2 ring-0 ring-black focus:outline-none focus:ring-1" required/>
                </div>
                <button type="submit" className="btn">Veranstaltung Erstellen</button>
            </form>
        </div>
    )
}

export default CreateEventForm;
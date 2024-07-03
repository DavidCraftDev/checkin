"use client";

import { submitHandlerEvent, submitHandlerStudyTime } from "./submitHandler";

function CreateEventForm(props: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1">
            {props.studyTime && props.user.competence ? <form action={submitHandlerStudyTime}>
                <div>
                    <label htmlFor="studyTime">Studienzeit</label><br />
                    <select defaultValue="default" id="studyTime" name="studyTime" className="rounded-full p-2 my-2 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1">
                        <option disabled value="default">Studienzeit wählen</option>
                        {props.user.competence.map((competence: any) => (
                            <option key={competence} value={competence}>{competence}</option>
                        ))}
                        <option value="parallel">Vertretung</option>
                    </select> <br />
                    <button type="submit" className="btn" >Studienzeit Erstellen</button>
                </div>
            </form> : null}
            <form action={submitHandlerEvent}>
                <div>
                    <label htmlFor="eventName">Veranstaltungsname</label><br />
                    <input type="text" name="eventName" id="eventName" className="rounded-full p-2 my-2 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                </div>
                <button type="submit" className="btn">Veranstaltung Erstellen</button>
            </form>
        </div>
    )
}

export default CreateEventForm;
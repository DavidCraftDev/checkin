'use client'

import { submitHandler } from "./page";

const EventForm = () => {
    return (
        <form action={submitHandler}>
        <div>
            <label htmlFor="eventName">Veranstaltungsname</label><br />
            <input type="text" name="name" id="eventName" className="rounded-full p-2 m-4 border-2 border-black-600" />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded-full">Erstellen</button>
        </form>
    )
}

export default EventForm;
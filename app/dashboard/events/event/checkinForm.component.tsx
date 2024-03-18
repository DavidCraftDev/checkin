'use client'

import { submitHandler, setEventID } from "./submitHandler";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

const CheckinForm = async () => {
    const eventID = useSearchParams().get("id") || "";
    return (
        <form action={await submitHandler} onSubmit={async () => setEventID(eventID)}>
            <p>QR Code Scannen Work in Progress</p>
        <div>
            <label htmlFor="username">Nutzername</label><br />
            <input type="text" name="name" id="username" className="rounded-full p-2 m-4 border-2 border-black-600" />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded-full">Hinzufügen</button>
        </form>
    )
}

export default CheckinForm;
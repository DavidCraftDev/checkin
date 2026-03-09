"use client";

import { toast } from "sonner";
import { submitCreateHandler } from "./submitCreateHandler";
import clsx from "clsx";
import { useState } from "react";

function UserCreateForm() {
    const [displaynameError, setDisplaynameError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    async function handleSubmit(formData: FormData) {
        setDisplaynameError(false)
        setUsernameError(false)
        setPasswordError(false)
        const data = await submitCreateHandler(formData)
        if (data === "displayname") {
            setDisplaynameError(true)
            toast.error("Der Name muss den ungeschriebenen Gesetzen der Behörde genügen — nur Buchstaben, Nummern und übliche Zeichen sind gestattet")
        } else if (data === "username") {
            setUsernameError(true)
            toast.error("Der Nutzername darf nur aus Buchstaben, Nummern und Punkten bestehen — so will es das Gesetz, das niemand je geschrieben hat")
        } else if (data === "password") {
            setPasswordError(true)
            toast.error("Ohne Geheimwort bleibt die Existenz unvollendet")
        } else if (data === "exist") {
            setUsernameError(true)
            toast.error("Dieser Name ist bereits einem anderen Wesen zugewiesen — die Verwaltung duldet keine Doppelgänger")
        } else {
            toast.success("Ein neues Wesen wurde in die Akten der Behörde aufgenommen")
        }
    }
    return (
        <div>
            <form action={handleSubmit} className="p-2">
                <div>
                    <label htmlFor="displayname">Name*</label><br />
                    <input type="text" name="displayname" id="displayname" placeholder="Max Mustermann" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": displaynameError })} required />
                    <br />
                    <label htmlFor="username">Nutzername*</label><br />
                    <input type="text" name="username" id="username" placeholder="max.mustermann" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required />
                    <br />
                    <label htmlFor="permission">Rechte*</label><br />
                    <select name="permission" id="permission" className="rounded-full p-2 m-4 border-2 bg-white border-gray-200">
                        <option value="0">Schüler</option>
                        <option value="1">Lehrer</option>
                        <option value="2">Admin</option>
                    </select>
                    <br />
                    <label htmlFor="group">Gruppen (Durch Komma getrennt)</label><br />
                    <input type="text" name="group" id="group" placeholder="Klasse 14.2" className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="needs">Benötigte Studienzeiten (Durch Komma getrennt)</label><br />
                    <input type="text" name="needs" id="needs" placeholder="Deutsch,Mathe,Englisch" className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="competence">Kompetenzen (Durch Komma getrennt)</label><br />
                    <input type="text" name="competence" id="competence" placeholder="Deutsch,Mathe,Englisch" className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="password">Passwort*</label><br />
                    <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required />
                </div>
                <button type="submit" className="btn">Nutzer erstellen</button>
            </form>
        </div>
    );
}

export default UserCreateForm;
'use client'

import toast from "react-hot-toast";
import { submitCreateHandler } from "./submitCreateHandler";
import clsx from "clsx";
import { FormEvent } from "react";

let displaynameError = false
let usernameError = false
let passwordError = false

function UserCreateForm() {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        displaynameError = false
        usernameError = false
        passwordError = false
        const formData = new FormData(event.currentTarget);
        const data = await submitCreateHandler(formData)
        if (data === "displayname") {
            displaynameError = true
            toast.error("Der Name darf nur Buchstaben, Nummern, Übliche Sonderzeichen und Leerzeichen enthalten")
        } else if (data === "username") {
            usernameError = true
            toast.error("Der Nutzername darf nur Buchstaben, Nummern und Punkte enthalten")
        } else if (data === "password") {
            passwordError = true
            toast.error("Bitte ein Passwort eingeben")
        } else if (data === "exist") {
            usernameError = true
            toast.error("Der Nutzername ist bereits belegt")
        } else {
            toast.success("Nutzer erstellt")
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="p-2">
                <div>
                    <label htmlFor="displayname">Name*</label><br />
                    <input type="text" name="displayname" id="displayname" placeholder="Max Mustermann" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": displaynameError })} required />
                    <br />
                    <label htmlFor="username">Nutzername*</label><br />
                    <input type="text" name="username" id="username" placeholder="max.mustermann" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required />
                    <br />
                    <label htmlFor="permission">Rechte*</label><br />
                    <select name="permission" id="permission" className="rounded-full p-2 m-4 border-2 bg-white border-black-600">
                        <option value="0">Schüler</option>
                        <option value="1">Lehrer</option>
                        <option value="2">Admin</option>
                    </select>
                    <br />
                    <label htmlFor="group">Gruppen (Durch Komma getrennt)</label><br />
                    <input type="text" name="group" id="group" placeholder="Klasse 14.2" className="rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                    <br />
                    <label htmlFor="needs">Benötigte Studienzeiten (Durch Komma getrennt)</label><br />
                    <input type="text" name="needs" id="needs" placeholder="Deutsch,Mathe,Englisch" className="rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                    <br />
                    <label htmlFor="competence">Kompetenzen (Durch Komma getrennt)</label><br />
                    <input type="text" name="competence" id="competence" placeholder="Deutsch,Mathe,Englisch" className="rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                    <br />
                    <label htmlFor="password">Passwort*</label><br />
                    <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required />
                </div>
                <button type="submit" className="btn">Nutzer erstellen</button>
            </form>
        </div>
    );
}

export default UserCreateForm;
'use client'

import toast from "react-hot-toast";
import clsx from "clsx";
import { submitEditHandler } from "./submitEditHandler";

let displaynameError = false
let usernameError = false
let passwordError = false

function UserEditForm(props: any) {
    async function handleSubmit(formdata: FormData) {
        displaynameError = false
        usernameError = false
        passwordError = false
        const data = await submitEditHandler(formdata, props.userData.id)
        if (data === "displayname") {
            displaynameError = true
            toast.error("Der Name darf nur Buchstaben, Nummern, Übliche Sonderzeichen und Leerzeichen enthalten")
            return
        }
        if (data === "username") {
            usernameError = true
            toast.error("Der Nutzername darf nur Buchstaben, Nummern und Punkte enthalten")
            return
        }
        if (data === "passwordAgain") {
            passwordError = true
            toast.error("Bitte ein Passwort eingeben")
            return
        }
        if (data === "exist") {
            usernameError = true
            toast.error("Der Nutzername ist bereits belegt")
            return
        }
        toast.success("Nutzer bearbeitet")
    }
    const userData = props.userData
    return (
        <div>
            <form action={handleSubmit} className="p-2">
                <div>
                    <label htmlFor="displayname">Name*</label><br />
                    <input type="text" name="displayname" id="displayname" placeholder="Max Mustermann" defaultValue={userData.displayname} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": displaynameError })} />
                    <br />
                    <label htmlFor="username">Nutzername*</label><br />
                    <input type="text" name="username" id="username" placeholder="max.mustermann" defaultValue={userData.username} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": usernameError })} />
                    <br />
                    <label htmlFor="permission">Rechte*</label><br />
                    <select name="permission" id="permission" defaultValue={userData.permission} className="rounded-full p-2 m-4 border-2 bg-white border-black-600">
                        <option value="0">Schüler</option>
                        <option value="1">Lehrer</option>
                        <option value="2">Admin</option>
                    </select>
                    <br />
                    <label htmlFor="group">Gruppe</label><br />
                    <input type="text" name="group" id="group" placeholder="Klasse 14.2" defaultValue={userData.group} className="rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                    <br />
                    <label htmlFor="needs" className={props.studyTime ? "" : "hidden"} >Benötigte Studienzeiten (Durch Komma getrennt)</label><br className={props.studyTime ? "" : "hidden"} />
                    <input type="text" name="needs" id="needs" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.needs} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "hidden": !props.studyTime })} />
                    <br className={props.studyTime ? "" : "hidden"} />
                    <label htmlFor="competence" className={props.studyTime ? "" : "hidden"} >Kompetenzen (Durch Komma getrennt)</label><br className={props.studyTime ? "" : "hidden"} />
                    <input type="text" name="competence" id="competence" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.competence} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "hidden": !props.studyTime })} />
                    <br className={props.studyTime ? "" : "hidden"} />
                    <label htmlFor="password">Neues Passwort setzen</label><br />
                    <input type="text" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": passwordError })} />
                    <br />
                    <label htmlFor="passwordAgain">Neues Passwort wiederholen</label><br />
                    <input type="text" name="passwordAgain" id="passwordAgain" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": passwordError })} />
                </div>
                <button type="submit" className="btn">Nutzer bearbeiten</button>
            </form>
        </div>
    );
}

export default UserEditForm;
;
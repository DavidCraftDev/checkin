'use client'

import toast from "react-hot-toast";
import clsx from "clsx";
import { submitEditHandler } from "./submitEditHandler";
import { FormEvent } from "react";

let displaynameError = false
let usernameError = false

function UserEditForm(props: any) {
    let config = props.config
    if (props.userData.username.startsWith("local/")) {
        config.use_ldap = false
        config.ldap_auto_groups = false
        config.ldap_auto_permission = false
        config.ldap_auto_studytime_data = false
    }
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        if (config.use_ldap && config.ldap_auto_groups && config.ldap_auto_permission && config.ldap_auto_studytime_data) return;
        event.preventDefault();
        displaynameError = false
        usernameError = false
        const formData = new FormData(event.currentTarget);
        const data = await submitEditHandler(formData, props.userData.id)
        if (data === "displayname") {
            displaynameError = true
            toast.error("Der Name darf nur Buchstaben, Nummern, Übliche Sonderzeichen und Leerzeichen enthalten")
        } else if (data === "username") {
            usernameError = true
            toast.error("Der Nutzername darf nur Buchstaben, Nummern und Punkte enthalten")
            return
        } else if (data === "exist") {
            usernameError = true
            toast.error("Der Nutzername ist bereits belegt")
            return
        } else {
            toast.success("Nutzer bearbeitet")
        }
    }
    const userData = props.userData
    return (
        <div>
            <form onSubmit={handleSubmit} className="p-2">
                <div>
                    <label htmlFor="displayname">Name*</label><br />
                    <input type="text" name="displayname" id="displayname" placeholder="Max Mustermann" defaultValue={userData.displayname} disabled={config.use_ldap} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": displaynameError })} />
                    <br />
                    <label htmlFor="username">Nutzername*</label><br />
                    <input type="text" name="username" id="username" placeholder="max.mustermann" defaultValue={userData.username} disabled={config.use_ldap} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": usernameError })} />
                    <br />
                    <label htmlFor="permission">Rechte*</label><br />
                    <select name="permission" id="permission" defaultValue={userData.permission} disabled={config.ldap_auto_permission} className="rounded-full p-2 m-4 border-2 bg-white border-black-600">
                        <option value="0">Schüler</option>
                        <option value="1">Lehrer</option>
                        <option value="2">Admin</option>
                    </select>
                    <br />
                    <label htmlFor="group">Gruppe</label><br />
                    <input type="text" name="group" id="group" placeholder="Klasse 14.2" defaultValue={userData.group} disabled={config.ldap_auto_permission} className="rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
                    <br className={config.studyTime ? "" : "hidden"} />
                    <label htmlFor="needs" className={config.studyTime ? "" : "hidden"} >Benötigte Studienzeiten (Durch Komma getrennt)</label><br className={config.studyTime ? "" : "hidden"} />
                    <input type="text" name="needs" id="needs" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.needs} disabled={config.ldap_auto_studytime_data} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "hidden": !config.studyTime })} />
                    <br className={config.studyTime ? "" : "hidden"} />
                    <label htmlFor="competence" className={config.studyTime ? "" : "hidden"} >Kompetenzen (Durch Komma getrennt)</label><br className={config.studyTime ? "" : "hidden"} />
                    <input type="text" name="competence" id="competence" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.competence} disabled={config.ldap_auto_studytime_data} className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "hidden": !config.studyTime })} />
                    <br className={config.use_ldap ? "hidden" : ""} />
                    <label htmlFor="password" className={config.use_ldap ? "hidden" : ""} >Neues Passwort setzen</label><br />
                    <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "hidden": config.use_ldap })} />
                </div>
                <button type="submit" className="btn">Nutzer bearbeiten</button>
            </form>
        </div>
    );
}

export default UserEditForm;
;
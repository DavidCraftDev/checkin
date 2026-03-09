'use client'

import { toast } from "sonner";
import clsx from "clsx";
import { submitEditHandler } from "./submitEditHandler";
import { useState } from "react";
import { User } from "@/app/src/modules/db";

interface UserEditFormProps {
    userData: User,
    config: {
        use_ldap: boolean,
        ldap_auto_groups: boolean,
        ldap_auto_permission: boolean,
        ldap_auto_studytime_data: boolean,
    }
}

function UserEditForm(props: UserEditFormProps) {
    const [displaynameError, setDisplaynameError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);

    let config = props.config
    if (props.userData.username.startsWith("local/")) {
        config.use_ldap = false
        config.ldap_auto_groups = false
        config.ldap_auto_permission = false
        config.ldap_auto_studytime_data = false
    }
    async function handleSubmit(formData: FormData) {
        if (config.use_ldap && config.ldap_auto_groups && config.ldap_auto_permission && config.ldap_auto_studytime_data) return;
        setDisplaynameError(false)
        setUsernameError(false)
        const data = await submitEditHandler(formData, props.userData.id)
        if (data === "displayname") {
            setDisplaynameError(true)
            toast.error("Der Name muss den ungeschriebenen Gesetzen der Behörde genügen — nur Buchstaben, Nummern und übliche Zeichen sind gestattet")
        } else if (data === "username") {
            setUsernameError(true)
            toast.error("Der Nutzername darf nur aus Buchstaben, Nummern und Punkten bestehen — so will es das Gesetz, das niemand je geschrieben hat")
            return
        } else if (data === "exist") {
            setUsernameError(true)
            toast.error("Dieser Name ist bereits einem anderen Wesen zugewiesen — die Verwaltung duldet keine Doppelgänger")
            return
        } else {
            toast.success("Die Akte des Wesens wurde mit zitternder Feder überarbeitet")
        }
    }
    const userData = props.userData
    return (
        <div>
            <form action={handleSubmit} className="p-2">
                <div>
                    <label htmlFor="displayname">Name*</label><br />
                    <input type="text" name="displayname" id="displayname" placeholder="Max Mustermann" defaultValue={userData.displayname} disabled={config.use_ldap} className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": displaynameError })} required />
                    <br />
                    <label htmlFor="username">Nutzername*</label><br />
                    <input type="text" name="username" id="username" placeholder="max.mustermann" defaultValue={userData.username.replace("local/", "")} disabled={config.use_ldap} className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required />
                    <br />
                    <label htmlFor="permission">Rechte*</label><br />
                    <select name="permission" id="permission" defaultValue={userData.permission} disabled={config.ldap_auto_permission} className="rounded-full p-2 m-4 border-2 bg-white border-gray-200">
                        <option value="0">Schüler</option>
                        <option value="1">Lehrer</option>
                        <option value="2">Admin</option>
                    </select>
                    <br />
                    <label htmlFor="group">Gruppen (Durch Komma getrennt)</label><br />
                    <input type="text" name="group" id="group" placeholder="Klasse 14.2" defaultValue={userData.group || ""} disabled={config.ldap_auto_permission} className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="needs">Benötigte Studienzeiten (Durch Komma getrennt)</label><br />
                    <input type="text" name="needs" id="needs" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.needs?.toString() || ""} disabled={config.ldap_auto_studytime_data} className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="competence">Kompetenzen (Durch Komma getrennt)</label><br />
                    <input type="text" name="competence" id="competence" placeholder="Deutsch,Mathe,Englisch" defaultValue={userData.competence?.toString() || ""} disabled={config.ldap_auto_studytime_data} className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br />
                    <label htmlFor="courses">Kurse (Durch Komma getrennt)</label><br />
                    <input type="text" name="courses" id="courses" placeholder="EF Deutsch GK 1,Q1 Mathe LK,Q1 Geschichte ZK" defaultValue={userData.courses?.toString() || ""} disabled={true} className="rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1" />
                    <br className={config.use_ldap ? "hidden" : ""} />
                    <label htmlFor="password" className={config.use_ldap ? "hidden" : ""} >Neues Passwort setzen</label><br />
                    <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black-600 focus:outline-hidden focus:ring-1", { "hidden": config.use_ldap })} />
                </div>
                <button type="submit" className="btn">Nutzer bearbeiten</button>
            </form>
        </div>
    );
}

export default UserEditForm;

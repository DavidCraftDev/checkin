"use client";

import { SubmitButton } from "@/app/src/ui/submitButton";
import { deleteAllSessions, deleteData, enableMaintanceMode, saveDefaultPassword, saveDefaultUsername, saveSchoolName } from "./actions";

export function SchoolNameForm(props: { schoolName: string }) {
    return (
        <form action={saveSchoolName} className="form">
            <label htmlFor="schoolName" className="label">Schulname</label>
            <input type="text" id="schoolName" name="schoolName" defaultValue={props.schoolName} placeholder="Beispiel-Gesamtschule" className="input" />
            <SubmitButton text="Speichern" />
        </form>
    )
}

export function MaintanceModeForm() {
    return (
        <form action={() => { if (confirm("Bist du dir sicher?")) enableMaintanceMode() }} className="form">
            <label className="label">Wartungsmodus</label>
            <p id="maintanceWarning" className="text-red-500">Achtung! Dies kann nicht über das Webinterface rückgängig gemacht werden!</p>
            <div className="btnWarning"><SubmitButton text="Wartungsmodus aktivieren" /></div>
        </form>
    )
}


export function DefaultUsernameForm(props: { username: string, ldap: boolean }) {
    return (
        <form action={saveDefaultUsername} className="form">
            <label htmlFor="username" className="label">Standardbenutzername</label>
            <div className={props.ldap ? "relative" : ""}>
                {props.ldap && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">local/</span>}
                <input type="text" id="username" name="username" defaultValue={props.username} placeholder="admin" className={props.ldap ? "input pl-14" : "input"} required />
            </div>
            <SubmitButton text="Speichern" />
        </form >
    )
}

export function DefaultPasswordForm(props: { password: string }) {
    return (
        <form action={saveDefaultPassword} className="form">
            <label htmlFor="password" className="label">Standardpasswort</label>
            <input type="password" id="password" name="password" defaultValue={props.password} placeholder="admin" className="input" required />
            <SubmitButton text="Speichern" />
        </form>
    )
}

export function DeleteAllSessionsForm() {
    return (
        <form action={() => { if (confirm("Bist du dir sicher, das du alle Nutzer abmelden möchtst?")) deleteAllSessions() }} className="form">
            <label htmlFor="sessionWarning" className="label">Alle Nutzer abmelden</label>
            <p id="sessionWarning" className="text-red-500">Achtung! Dies Löscht alle Nutzersessions, dadurch müssen sich alle Nutzer neu anmelden!</p>
            <div className="btnWarning"><SubmitButton text="Alle Nutzer abmelden" /></div>
        </form>
    )
}

export function DeleteAllDataForm() {
    return (
        <form action={() => { if (confirm("Bist du dir sicher, das du alle Daten löschen möchtest?")) deleteData() }} className="form">
            <label htmlFor="dataWarning" className="label">Alle Daten löschen</label>
            <p id="dataWarning" className="text-red-500">Achtung! Dies löscht alle Studienzeiten, Anwesenheiten und Nutzersessions!</p>
            <div className="btnWarning"><SubmitButton text="Alle Daten löschen" /></div>
        </form>
    )
}
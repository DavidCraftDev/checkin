"use client";

import { SubmitButton } from "@/app/src/ui/submitButton";
import { disableLDAP, enableLDAP, saveLDAPBindCredentials, saveLDAPURI, testLDAPConnection } from "./actions";
import { useSearchParams } from "next/navigation";

export function LDAPToggleForm(props: { enabled: boolean }) {
    if (props.enabled) {
        return (
            <form action={() => { if (confirm("Bist du dir sicher, das du LDAP deaktivieren und damit alle Daten der Nutzer aus dem LDAP-Verzeichnis löschen möchtest?")) disableLDAP() }} className="form">
                <label htmlFor="btnWarning" className="label">LDAP deaktivieren</label>
                <p id="ldapWarning" className="text-red-500">Achtung! Dies löscht alle Nutzerdaten aus dem LDAP-Verzeichnis!</p>
                <p>Bei lokalen Nutzern wird das local/ vor dem Benutzernamen wieder entfernt.</p>
                <div className="btnWarning"><SubmitButton text="LDAP deaktivieren und Daten löschen" /></div>
            </form>
        )
    } else {
        return (
            <form action={() => { if (confirm("Bist du dir sicher, das du LDAP aktivieren möchtest? Stelle bitte vorher sicher, das alle restlichen LDAP Einstellungen getroffen wurden.")) enableLDAP() }} className="form">
                <label htmlFor="ldapWarning" className="label">LDAP aktivieren</label>
                <p id="ldapWarning">Dadurch werden bei den lokalen Nutzeraccounts vor dem Benutzernamen local/ angefügt. Bitte erst aktivieren wenn die restlichen LDAP Einstellungen getroffen sind.</p>
                <SubmitButton text="LDAP aktivieren" />
            </form>
        )
    }
}

export function LDAPTestConnection() {
    const searchParams = useSearchParams();
    const testResult = searchParams.get("testResult");
    const userCount = searchParams.get("userCount");
    return (
        <form action={testLDAPConnection} className="form">
            <label htmlFor="ldapTest" className="label">LDAP Verbindung testen</label>
            {testResult && <p>Verbindung: {testResult}</p>}
            {userCount && <p>Nutzer gefunden: {userCount}</p>}
            <SubmitButton text="Testen" />
        </form>
    )
}

export function LDAPURIForm(props: { uri: string }) {
    return (
        <form action={saveLDAPURI} className="form">
            <label htmlFor="ldapURI" className="label">LDAP URI</label>
            <input type="url" id="ldapURI" name="ldapURI" defaultValue={props.uri} placeholder="ldaps://example.com" className="input" required />
            <SubmitButton text="Speichern" />
        </form>
    )
}

export function LDAPBindCredentialsForm(props: { dn: string, password: string }) {
    return (
        <form action={saveLDAPBindCredentials} className="form">
            <label htmlFor="ldapDN" className="label">LDAP DN</label>
            <input type="text" id="ldapDN" name="ldapDN" defaultValue={props.dn} placeholder="cn=admin,dc=example,dc=com" className="input" required />
            <label htmlFor="ldapPassword" className="label">LDAP Passwort</label>
            <input type="password" id="ldapPassword" name="ldapPassword" defaultValue={props.password} className="input" required />
            <SubmitButton text="Speichern" />
        </form>
    )
}
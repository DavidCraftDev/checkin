"use server";

import { config_data } from "@/app/src/modules/data/config";
import { LDAPBindCredentialsForm, LDAPTestConnection, LDAPToggleForm, LDAPURIForm } from "./forms";
import { LDAPNotifications } from "./notifications";
import { redirect } from "next/navigation";

async function ldapConfig() {
    redirect("/administration");
    /*return (
        <div>
            <LDAPNotifications />
            <h1>LDAP Einstellungen</h1>
            <div className="formLayout">
                <LDAPToggleForm enabled={config_data.LDAP.ENABLE} />
                <LDAPURIForm uri={config_data.LDAP.URI} />
                <LDAPBindCredentialsForm dn={config_data.LDAP.BIND_CREADENTIALS.DN} password={config_data.LDAP.BIND_CREADENTIALS.PASSWORD} />
                <LDAPTestConnection />
            </div>
        </div>
    )*/
}

export default ldapConfig;
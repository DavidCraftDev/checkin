"use server";

import { config_data } from "../src/modules/config/config";
import { DefaultPasswordForm, DefaultUsernameForm, DeleteAllDataForm, DeleteAllSessionsForm, MaintanceModeForm, SchoolNameForm } from "./general/forms";
import { GeneralNotifications } from "./general/notifications";

async function general() {
    return (
        <div>
            <GeneralNotifications />
            <h1>Allgemeine Einstellungen</h1>
            <div className="formLayout">
                <SchoolNameForm schoolName={config_data.SCHOOL_NAME} />
                <MaintanceModeForm />
                <DefaultUsernameForm username={config_data.DEFAULT_LOGIN.USERNAME} ldap={config_data.LDAP.ENABLE} />
                <DefaultPasswordForm password={config_data.DEFAULT_LOGIN.PASSWORD} />
                <DeleteAllSessionsForm />
                <DeleteAllDataForm />
            </div>
        </div>
    );
}

export default general;
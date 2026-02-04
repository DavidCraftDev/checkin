"use server";

import { config_data } from "@/app/src/modules/data/config";
import { DefaultPasswordForm, DefaultUsernameForm, DeleteAllDataForm, DeleteAllSessionsForm, MaintanceModeForm, SchoolNameForm } from "@/app/administration/general/forms";
import { GeneralNotifications } from "@/app/administration/general/notifications";

async function GeneralPage() {
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

export default GeneralPage;
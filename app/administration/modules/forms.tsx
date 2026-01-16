"use client";

import { SubmitButton } from "@/components/submitButton";
import { toggleSponsorenlaufModule } from "./actions";

export default function SponsorenlaufModuleCheck(props: { defaultChecked: boolean }) {
    return (
        <form action={toggleSponsorenlaufModule} className="form">
            <label className="label">Sponsorenlauf-Modul</label>

            <div className="flex items-center space-x-3 mb-6">
                <input
                    type="checkbox"
                    id="sponsorenlauf"
                    name="sponsorenlauf"
                    defaultChecked={props.defaultChecked}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="sponsorenlauf" className="text-gray-900 text-sm">
                    Sponsorenlauf-Modul aktivieren
                </label>
            </div>

            <SubmitButton text="Speichern" />
        </form>
    );
}
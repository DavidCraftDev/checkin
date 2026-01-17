import { getSessionUser } from "../src/modules/auth/cookieManager";
import { redirect } from "next/navigation";
import { countLogs } from "../src/modules/logger";
import db from "../src/modules/db";

async function AdministrationPage() {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 2) redirect("/dashboard");

    const userCount = await db.user.count();
    const eventCount = await db.event.count();
    const attendanceCount = await db.attendance.count();
    const logCount = await countLogs();

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Administration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-4xl font-bold text-blue-600 mb-2">{userCount}</span>
                    <span className="text-gray-600 font-medium">Nutzer</span>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-4xl font-bold text-green-600 mb-2">{eventCount}</span>
                    <span className="text-gray-600 font-medium">Studienzeiten</span>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-4xl font-bold text-purple-600 mb-2">{attendanceCount}</span>
                    <span className="text-gray-600 font-medium">Anwesenheiten</span>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-4xl font-bold text-gray-600 mb-2">{logCount}</span>
                    <span className="text-gray-600 font-medium">Log-Einträge</span>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="/administration/user" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-800">Nutzerverwaltung</h3>
                        <p className="text-sm text-gray-500 mt-1">Nutzer erstellen, bearbeiten und suchen.</p>
                    </a>
                    <a href="/administration/groups" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-800">Gruppenverwaltung</h3>
                        <p className="text-sm text-gray-500 mt-1">Gruppen einsehen und bearbeiten.</p>
                    </a>
                    <a href="/administration/logs" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-800">System-Logs</h3>
                        <p className="text-sm text-gray-500 mt-1">Fehler und Aktivitäten prüfen.</p>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdministrationPage;

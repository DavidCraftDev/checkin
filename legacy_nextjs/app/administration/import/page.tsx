import { TeacherCompetenceImport } from "./forms";

async function ImportPage() {
    return (
        <div>
            <h1>Daten Import</h1>
            <p>Datenimport aus SchiLD-NRW wird bald erweitert...</p>
            <div className="formLayout">
                <TeacherCompetenceImport />
            </div>
        </div>
    );
}

export default ImportPage;
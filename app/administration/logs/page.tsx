import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import logger from "@/app/src/modules/logger";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LogsPage(props: { searchParams: SearchParams }) {
    const { session } = await getCurrentSession();
    if (!session) redirect("/login");

    const searchParams = await props.searchParams;

    // List all log files in the log directory
    const logDir = path.join(process.cwd(), "log");
    let logFiles: string[] = [];
    try {
        logFiles = fs.readdirSync(logDir).filter(f => f.endsWith(".log"));
    } catch (e) {
        logFiles = [];
    }
    logFiles.sort();

    // Read selected log file (default: latest)
    const selectedFile = searchParams?.file as string || logFiles[logFiles.length - 1];
    let logContent = "";
    if (selectedFile) {
        try {
            logContent = fs.readFileSync(path.join(logDir, selectedFile), "utf-8");
        } catch (e) {
            logContent = "Die Protokollakte entzieht sich der Lektüre.";
            logger.error(`Die Protokollakte ${selectedFile} verweigert die Lektüre: ${e}`, "Logs");
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Log-Dateien</h1>
            <p className="mb-4">Hier können Sie die Log-Dateien einsehen.</p>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4">
                    <ul className="bg-white rounded-md border border-gray-200 shadow divide-y divide-gray-100">
                        {logFiles.map(file => (
                            <li key={file}>
                                <a
                                    href={`?file=${encodeURIComponent(file)}`}
                                    className={`block px-4 py-2 hover:bg-green-100 transition-colors ${file === selectedFile ? "font-bold text-green-700 bg-green-50" : "text-gray-800"}`}
                                >
                                    {file}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full md:w-3/4">
                    <div className="bg-white rounded-md border border-gray-200 shadow p-4 overflow-auto" style={{ maxHeight: 500 }}>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-semibold text-gray-700">{selectedFile || "Keine Datei ausgewählt"}</span>
                            <a
                                href={selectedFile ? `/log/${selectedFile}` : "#"}
                                download={selectedFile}
                                className="btn btn-sm"
                                style={{ pointerEvents: selectedFile ? "auto" : "none", opacity: selectedFile ? 1 : 0.5 }}
                            >
                                Download
                            </a>
                        </div>
                        <pre className="text-xs font-mono text-gray-900 whitespace-pre-wrap break-all select-all" style={{ background: "#f8fafc" }}>
                            {logContent}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
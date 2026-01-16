import { Groups } from "@/types/groups";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function GroupsTable(props: { groups: Groups[] }) {
    return (
        <div className="overflow-x-auto">
            <div className="table w-full">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Gruppenname</th>
                            <th className="px-6 py-3">Schüler</th>
                            <th className="px-6 py-3">Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.groups.map((group) => (
                            <tr key={group.group} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{group.group}</td>
                                <td className="px-6 py-4">{group.members} Schüler</td>
                                <td className="px-6 py-4">
                                    <Link href={`/dashboard/groups/group?groupId=${group.group}`}>
                                        <Button variant="outline">Anzeigen</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.groups.length === 0 ? <p className="text-center italic m-2">Keine Gruppen vorhanden</p> : null}
            </div>
        </div>
    )
}

export default GroupsTable;

import { getCurrentSession } from "@/lib/auth/cookieManager";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile, { Image } from "write-excel-file/node";

export async function GET() {
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse(null, { status: 401 });
    if (user.permission < 2) return new NextResponse(null, { status: 403 });

    // Get users alphabetically sorted by display name
    // Set group to "Lehrer" if permission is not 0, otherwise use the first group
    const users = await db.user.findMany({
        orderBy: {
            displayname: "asc"
        }
    });
    const userData = await Promise.all(users.map(async user => ({
        id: user.id,
        displayName: user.displayName,
        group: user.permission === 0 ? user.groups[0] || "Keine Klasse" : "Lehrer",
        qrCode: await QRCode.toString("checkin://" + user.id, { errorCorrectionLevel: "H", type: "utf8" })
    })));

    // Generate QR codes for each user
    const qrCodeBuffers: Record<string, Buffer> = {};
    await Promise.all(
        userData.map(async user => {
            qrCodeBuffers[user.id] = await QRCode.toBuffer("checkin://" + user.id, { errorCorrectionLevel: "H", type: "png", margin: 1 });
        })
    );

    // Create XLSX file
    const sheetData: SheetData[] = [];
    const imagesAll: Image[][] = [];
    const sheetNames: Array<string> = [];
    const columnData: Columns[] = [];

    const allUserImages: Image[] = [];
    const allUserSheetData: SheetData = [];
    allUserSheetData.push([
        {
            type: String,
            value: "QR-Code Übersicht",
            fontWeight: "bold"
        }
    ]);
    allUserSheetData.push([]);
    allUserSheetData.push([
        {
            type: String,
            value: "Name",
            fontWeight: "bold"
        },
        {
            type: String,
            value: "Klasse",
            fontWeight: "bold"
        },
        {
            type: String,
            value: "QR-Code",
            fontWeight: "bold"
        }
    ]);
    for (const user of userData) {
        const qrCodeImage: Image = {
            content: qrCodeBuffers[user.id],
            contentType: "image/png",
            width: 124,
            height: 124,
            dpi: 96,
            anchor: {
                row: allUserSheetData.length + 1,
                column: 3
            },
        };
        allUserImages.push(qrCodeImage);
        allUserSheetData.push([
            {
                type: String,
                value: user.displayName,
                height: 94,
                alignVertical: "center",
                wrap: true
            },
            {
                type: String,
                value: user.groups,
                height: 94,
                alignVertical: "center",
                wrap: true
            }
        ]);
        allUserSheetData.push([]);
    }
    sheetData.push(allUserSheetData);
    sheetNames.push("QR-Codes");
    columnData.push([
        { width: 20 },
        { width: 15 },
        { width: 16 }
    ]);
    imagesAll.push(allUserImages);

    // Create sheet for every group
    const groups = Array.from(new Set(userData.map(user => user.groups))).sort((a, b) => a.localeCompare(b));
    for (const group of groups) {
        const groupSheetData: SheetData = [];
        const groupImages: Image[] = [];
        groupSheetData.push([
            {
                type: String,
                value: "QR-Codes für " + group,
                fontWeight: "bold"
            }
        ]);
        groupSheetData.push([]);
        groupSheetData.push([
            {
                type: String,
                value: "Name",
                fontWeight: "bold"
            },
            {
                type: String,
                value: "QR-Code",
                fontWeight: "bold"
            },
            {},
            {
                type: String,
                value: "Name",
                fontWeight: "bold"
            },
            {
                type: String,
                value: "QR-Code",
                fontWeight: "bold"
            }
        ]);

        const usersInGroup = userData.filter(u => u.groups === group);
        for (let i = 0; i < usersInGroup.length; i += 2) {
            const user1 = usersInGroup[i];
            const user2 = usersInGroup[i + 1];

            // QR Code for user 1
            const qrCodeImage1: Image = {
                content: qrCodeBuffers[user1.id],
                contentType: "image/png",
                width: 124,
                height: 124,
                dpi: 96,
                anchor: {
                    row: groupSheetData.length + 1,
                    column: 2
                },
            };
            groupImages.push(qrCodeImage1);

            // QR Code for user 2 (if exists)
            if (user2) {
                const qrCodeImage2: Image = {
                    content: qrCodeBuffers[user2.id],
                    contentType: "image/png",
                    width: 124,
                    height: 124,
                    dpi: 96,
                    anchor: {
                        row: groupSheetData.length + 1,
                        column: 5
                    },
                };
                groupImages.push(qrCodeImage2);
            }

            groupSheetData.push([
                {
                    type: String,
                    value: user1.displayName,
                    height: 94,
                    alignVertical: "center",
                    wrap: true
                },
                {},
                {},
                user2 ? {
                    type: String,
                    value: user2.displayName,
                    height: 94,
                    alignVertical: "center",
                    wrap: true
                } : { type: String, value: "" }
            ]);
            groupSheetData.push([]);
        }

        sheetData.push(groupSheetData);
        sheetNames.push(group);
        columnData.push([
            { width: 20 },
            { width: 16 },
            { width: 2 },
            { width: 20 },
            { width: 16 }
        ]);
        imagesAll.push(groupImages);
    }

    const buffer = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetNames, columns: columnData, images: imagesAll });
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": 'application/vnd.ms-excel',
            "Content-Disposition": 'attachment; filename="qrcodes.xlsx"',
        },
    });
}
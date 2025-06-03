import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import db from "@/app/src/modules/db";
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
        displayName: user.displayname,
        group: user.permission === 0 ? user.group[0] || "Keine Klasse" : "Lehrer",
        qrCode: await QRCode.toString("checkin://" + user.id, { errorCorrectionLevel: "H", type: "utf8" })
    })));

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
        const qrCodeBuffer = await QRCode.toBuffer("checkin://" + user.id, { errorCorrectionLevel: "H", type: "png", margin: 1 });
        const qrCodeImage: Image = {
            content: qrCodeBuffer,
            contentType: "image/png",
            width: 100,
            height: 100,
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
                height: 80,
                alignVertical: "center",
                wrap: true
            },
            {
                type: String,
                value: user.group,
                height: 80,
                alignVertical: "center",
                wrap: true
            }
        ]);
    }
    sheetData.push(allUserSheetData);
    sheetNames.push("QR-Codes");
    columnData.push([
        { width: 20 },
        { width: 15 },
        { width: 12.5 }
    ]);
    imagesAll.push(allUserImages);

    // Create sheet for every group
    const groups = Array.from(new Set(userData.map(user => user.group))).sort((a, b) => a.localeCompare(b));
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

        const usersInGroup = userData.filter(u => u.group === group);
        for (let i = 0; i < usersInGroup.length; i += 2) {
            const user1 = usersInGroup[i];
            const user2 = usersInGroup[i + 1];

            // QR Code for user 1
            const qrCodeBuffer1 = await QRCode.toBuffer("checkin://" + user1.id, { errorCorrectionLevel: "H", type: "png", margin: 1 });
            const qrCodeImage1: Image = {
                content: qrCodeBuffer1,
                contentType: "image/png",
                width: 100,
                height: 100,
                dpi: 96,
                anchor: {
                    row: groupSheetData.length + 1,
                    column: 2
                },
            };
            groupImages.push(qrCodeImage1);

            // QR Code for user 2 (if exists)
            if (user2) {
                const qrCodeBuffer2 = await QRCode.toBuffer("checkin://" + user2.id, { errorCorrectionLevel: "H", type: "png", margin: 1 });
                const qrCodeImage2: Image = {
                    content: qrCodeBuffer2,
                    contentType: "image/png",
                    width: 100,
                    height: 100,
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
                    height: 80,
                    alignVertical: "center",
                    wrap: true
                },
                {},
                {},
                user2 ? {
                    type: String,
                    value: user2.displayName,
                    height: 80,
                    alignVertical: "center",
                    wrap: true
                } : { type: String, value: "" }
            ]);
        }

        sheetData.push(groupSheetData);
        sheetNames.push(group);
        columnData.push([
            { width: 20 },
            { width: 12.5 },
            { width: 5 },
            { width: 20 },
            { width: 12.5 }
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
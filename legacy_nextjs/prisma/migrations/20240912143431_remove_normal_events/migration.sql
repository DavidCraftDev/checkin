/*
  Manuelly created migration to remove the normal events and rename the attendances table

*/

-- Delete normal events
DELETE FROM "Events" WHERE "studyTime" = FALSE;

-- AlterTable
ALTER TABLE "Events" DROP COLUMN "studyTime";

-- AlterTable
ALTER TABLE "Events" RENAME COLUMN "name" TO "type";

-- Split type out of the old name
UPDATE "Events" SET "type" = split_part("type", ' ', 2);

-- AlterTable
ALTER TABLE "Attendance" RENAME TO "Attendances";

-- Replace note: with Notiz: and parallel: with Vertretung: in types of attendances
UPDATE "Attendances" SET "type" = replace("type", 'note:', 'Notiz:');
UPDATE "Attendances" SET "type" = replace("type", 'parallel:', 'Vertretung:');

-- Set teacherNote to empty if the eventID of the attendance is NOTE
UPDATE "Attendances" SET "teacherNote" = '' WHERE "eventID" = 'NOTE';

-- Delete events that dont have attendances
DELETE FROM "Events" WHERE NOT EXISTS (SELECT 1 FROM "Attendances" WHERE "eventID" = "Events"."id");

-- Delete attendance where the eventID is NOTE and the studentNote or the type is empty
DELETE FROM "Attendances" WHERE "eventID" = 'NOTE' AND ("studentNote" = '' OR "type" = '');
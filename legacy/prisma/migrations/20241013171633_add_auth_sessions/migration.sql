/*
  Warnings:

  - You are about to drop the column `loginVersion` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendances" RENAME CONSTRAINT "Attendance_pkey" TO "Attendances_pkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "loginVersion",
ADD COLUMN     "pwdLastSet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Attendance_id_key" RENAME TO "Attendances_id_key";

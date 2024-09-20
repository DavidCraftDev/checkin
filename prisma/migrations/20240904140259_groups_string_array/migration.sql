/*
  Warnings:

  - The `needs` column on the `StudyTimeData` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `group` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `needs` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `competence` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StudyTimeData" DROP COLUMN "needs";
ALTER TABLE "StudyTimeData" ADD COLUMN  "needs" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "group",
ADD COLUMN     "group" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "needs",
ADD COLUMN     "needs" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "competence",
ADD COLUMN     "competence" TEXT[] DEFAULT ARRAY[]::TEXT[];

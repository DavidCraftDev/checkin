-- AlterTable
ALTER TABLE "Attendances" ADD COLUMN     "attended" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "courses" TEXT[];

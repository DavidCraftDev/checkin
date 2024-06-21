-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StudyTimeData" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "completed" JSONB NOT NULL,
    "missing" JSONB NOT NULL,
    "cw" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "StudyTimeData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyTimeData_id_key" ON "StudyTimeData"("id");

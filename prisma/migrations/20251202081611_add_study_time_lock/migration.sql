-- CreateTable
CREATE TABLE "LockedStudyTimes" (
    "id" TEXT NOT NULL,
    "lessonID" TEXT NOT NULL,
    "courseID" TEXT NOT NULL,

    CONSTRAINT "LockedStudyTimes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LockedStudyTimes_id_key" ON "LockedStudyTimes"("id");

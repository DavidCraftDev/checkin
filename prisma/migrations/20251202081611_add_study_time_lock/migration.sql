-- CreateTable
CREATE TABLE "LockedStudyTimes" (
    "lessonID" TEXT NOT NULL,
    "courseID" TEXT NOT NULL,

    CONSTRAINT "LockedStudyTimes_pkey" PRIMARY KEY ("lessonID")
);

-- CreateIndex
CREATE UNIQUE INDEX "LockedStudyTimes_id_key" ON "LockedStudyTimes"("lessonID");
-- CreateTable
CREATE TABLE "ClosedStudyTimes" (
    "lessonID" TEXT NOT NULL,
    "courseID" TEXT NOT NULL,

    CONSTRAINT "ClosedStudyTimes_pkey" PRIMARY KEY ("lessonID")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClosedStudyTimes_id_key" ON "ClosedStudyTimes"("lessonID");
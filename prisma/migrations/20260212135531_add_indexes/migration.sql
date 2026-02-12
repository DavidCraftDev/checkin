-- CreateIndex
CREATE INDEX "Attendances_userID_idx" ON "Attendances"("userID");

-- CreateIndex
CREATE INDEX "Attendances_eventID_idx" ON "Attendances"("eventID");

-- CreateIndex
CREATE INDEX "Attendances_cw_idx" ON "Attendances"("cw");

-- CreateIndex
CREATE INDEX "Attendances_userID_cw_idx" ON "Attendances"("userID", "cw");

-- CreateIndex
CREATE INDEX "Events_user_idx" ON "Events"("user");

-- CreateIndex
CREATE INDEX "Events_cw_idx" ON "Events"("cw");

-- CreateIndex
CREATE INDEX "StudyTimeData_userID_idx" ON "StudyTimeData"("userID");

-- CreateIndex
CREATE INDEX "StudyTimeData_cw_idx" ON "StudyTimeData"("cw");

-- CreateEnum
CREATE TYPE "TraficLightFeedback" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- AlterTable
ALTER TABLE "Attendances" ADD COLUMN     "feedback" "TraficLightFeedback" NOT NULL DEFAULT 'GREEN',
ADD COLUMN     "goodAtmosphere" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productiveWork" BOOLEAN NOT NULL DEFAULT true;

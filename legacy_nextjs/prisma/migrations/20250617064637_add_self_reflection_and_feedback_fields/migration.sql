-- CreateEnum
CREATE TYPE "TrafficLightFeedback" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- AlterTable
ALTER TABLE "Attendances" ADD COLUMN     "feedback" "TrafficLightFeedback" NOT NULL DEFAULT 'GREEN',
ADD COLUMN     "goodAtmosphere" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productiveWork" BOOLEAN NOT NULL DEFAULT true;

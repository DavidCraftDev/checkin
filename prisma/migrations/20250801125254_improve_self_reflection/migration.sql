/*
  Warnings:

  - You are about to drop the column `goodAtmosphere` on the `Attendances` table. All the data in the column will be lost.
  - You are about to drop the column `productiveWork` on the `Attendances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendances" DROP COLUMN "goodAtmosphere",
DROP COLUMN "productiveWork",
ADD COLUMN     "selfReflection" TEXT;

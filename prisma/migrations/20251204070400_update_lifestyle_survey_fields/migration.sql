/*
  Warnings:

  - You are about to alter the column `mealNote` on the `LifestyleSurvey` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `roommateWish` on the `LifestyleSurvey` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - Made the column `mealPlace` on table `LifestyleSurvey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mealNote` on table `LifestyleSurvey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."LifestyleSurvey" ALTER COLUMN "mealPlace" SET NOT NULL,
ALTER COLUMN "mealNote" SET NOT NULL,
ALTER COLUMN "mealNote" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "roommateWish" SET DATA TYPE VARCHAR(150);

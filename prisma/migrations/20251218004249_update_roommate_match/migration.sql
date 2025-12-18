/*
  Warnings:

  - You are about to drop the column `caseMultiplier` on the `RoommateMatch` table. All the data in the column will be lost.
  - You are about to drop the column `comboMultiplier` on the `RoommateMatch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RoommateMatch" DROP COLUMN "caseMultiplier",
DROP COLUMN "comboMultiplier";

/*
  Warnings:

  - Added the required column `matchBatchId` to the `RoommateMatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RoommateMatch" ADD COLUMN     "matchBatchId" TEXT NOT NULL;

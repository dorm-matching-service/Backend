/*
  Warnings:

  - You are about to drop the column `google_sub` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_google_sub_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "google_sub";

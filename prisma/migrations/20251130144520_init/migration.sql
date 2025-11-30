/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `picture_url` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "picture_url",
ADD COLUMN     "consent_privacy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_privacy_at" TIMESTAMP(3),
ADD COLUMN     "consent_privacy_version" INTEGER;

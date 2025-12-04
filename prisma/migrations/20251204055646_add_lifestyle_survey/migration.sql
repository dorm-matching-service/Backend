-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."ShowerFreq" AS ENUM ('ONCE', 'TWICE', 'TWO_DAYS', 'RARE');

-- CreateEnum
CREATE TYPE "public"."CleaningFreq" AS ENUM ('ONCE', 'TWICE', 'TWO_DAYS', 'RARE');

-- CreateEnum
CREATE TYPE "public"."ActivityLevel" AS ENUM ('SMOKER', 'NON_SMOKER');

-- CreateEnum
CREATE TYPE "public"."OutgoingFreq" AS ENUM ('EVERY_WEEK', 'TWO_WEEKS', 'WEEKENDS', 'VACATION');

-- CreateEnum
CREATE TYPE "public"."MealPlace" AS ENUM ('DORM', 'OUTSIDE');

-- CreateEnum
CREATE TYPE "public"."GamingTime" AS ENUM ('NONE', 'ONE_MINUS', 'ONE_TO_THREE', 'THREE_PLUS');

-- CreateEnum
CREATE TYPE "public"."DrinkFreq" AS ENUM ('NONE', 'RARE', 'ONE_TWO', 'THREE_PLUS');

-- CreateEnum
CREATE TYPE "public"."EI" AS ENUM ('E', 'I');

-- CreateEnum
CREATE TYPE "public"."NS" AS ENUM ('N', 'S');

-- CreateEnum
CREATE TYPE "public"."TF" AS ENUM ('T', 'F');

-- CreateEnum
CREATE TYPE "public"."JP" AS ENUM ('J', 'P');

-- CreateTable
CREATE TABLE "public"."LifestyleSurvey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "mbti1" "public"."EI" NOT NULL,
    "mbti2" "public"."NS" NOT NULL,
    "mbti3" "public"."TF" NOT NULL,
    "mbti4" "public"."JP" NOT NULL,
    "wakeTimeMinutes" INTEGER NOT NULL,
    "sleepTimeMinutes" INTEGER NOT NULL,
    "showerFreq" "public"."ShowerFreq" NOT NULL,
    "cleaningFreq" "public"."CleaningFreq" NOT NULL,
    "activityLevel" "public"."ActivityLevel" NOT NULL,
    "roomTraits" TEXT[],
    "coldSensitivity" BOOLEAN NOT NULL,
    "hotSensitivity" BOOLEAN NOT NULL,
    "outgoingFreq" "public"."OutgoingFreq" NOT NULL,
    "mealPlace" "public"."MealPlace",
    "mealNote" TEXT,
    "gamingTime" "public"."GamingTime" NOT NULL,
    "drinkFreq" "public"."DrinkFreq" NOT NULL,
    "homeStyle" TEXT[],
    "hobbies" TEXT[],
    "roommateWish" TEXT NOT NULL,
    "selfTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifestyleSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleSurvey_userId_key" ON "public"."LifestyleSurvey"("userId");

-- AddForeignKey
ALTER TABLE "public"."LifestyleSurvey" ADD CONSTRAINT "LifestyleSurvey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

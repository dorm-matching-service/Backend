-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONNECTED');

-- CreateTable
CREATE TABLE "public"."RoommateMatch" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "baseScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "caseMultiplier" DOUBLE PRECISION NOT NULL,
    "comboMultiplier" DOUBLE PRECISION NOT NULL,
    "hobbyBonus" DOUBLE PRECISION NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RoommateMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLike" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoommateMatch_requesterId_idx" ON "public"."RoommateMatch"("requesterId");

-- CreateIndex
CREATE INDEX "RoommateMatch_candidateId_idx" ON "public"."RoommateMatch"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateMatch_requesterId_candidateId_key" ON "public"."RoommateMatch"("requesterId", "candidateId");

-- CreateIndex
CREATE INDEX "UserLike_fromUserId_idx" ON "public"."UserLike"("fromUserId");

-- CreateIndex
CREATE INDEX "UserLike_toUserId_idx" ON "public"."UserLike"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLike_fromUserId_toUserId_key" ON "public"."UserLike"("fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "public"."RoommateMatch" ADD CONSTRAINT "RoommateMatch_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoommateMatch" ADD CONSTRAINT "RoommateMatch_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLike" ADD CONSTRAINT "UserLike_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLike" ADD CONSTRAINT "UserLike_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

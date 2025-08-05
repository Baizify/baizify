-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalFrames" INTEGER NOT NULL DEFAULT 4;

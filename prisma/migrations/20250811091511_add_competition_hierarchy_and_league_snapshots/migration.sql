-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "collection" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LeagueTableSnapshot" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "framesFor" INTEGER NOT NULL DEFAULT 0,
    "framesAgainst" INTEGER NOT NULL DEFAULT 0,
    "frameDifference" INTEGER NOT NULL DEFAULT 0,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LeagueTableSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueTableSnapshot_competitionId_seasonId_snapshotDate_idx" ON "LeagueTableSnapshot"("competitionId", "seasonId", "snapshotDate");

-- CreateIndex
CREATE INDEX "LeagueTableSnapshot_teamId_snapshotDate_idx" ON "LeagueTableSnapshot"("teamId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueTableSnapshot_competitionId_seasonId_teamId_snapshotD_key" ON "LeagueTableSnapshot"("competitionId", "seasonId", "teamId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "LeagueTableSnapshot" ADD CONSTRAINT "LeagueTableSnapshot_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTableSnapshot" ADD CONSTRAINT "LeagueTableSnapshot_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTableSnapshot" ADD CONSTRAINT "LeagueTableSnapshot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

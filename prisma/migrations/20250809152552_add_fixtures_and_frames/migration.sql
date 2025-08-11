-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "homeCampaignId" TEXT NOT NULL,
    "awayCampaignId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "venue" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frame" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "frameNumber" INTEGER NOT NULL,
    "homePlayerId" TEXT,
    "awayPlayerId" TEXT,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Frame_fixtureId_frameNumber_key" ON "Frame"("fixtureId", "frameNumber");

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeCampaignId_fkey" FOREIGN KEY ("homeCampaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayCampaignId_fkey" FOREIGN KEY ("awayCampaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_homePlayerId_fkey" FOREIGN KEY ("homePlayerId") REFERENCES "CampaignPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_awayPlayerId_fkey" FOREIGN KEY ("awayPlayerId") REFERENCES "CampaignPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "CampaignPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

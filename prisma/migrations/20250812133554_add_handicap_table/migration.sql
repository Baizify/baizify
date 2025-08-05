-- CreateTable
CREATE TABLE "Handicap" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 10,
    "campaignPlayerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Handicap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Handicap" ADD CONSTRAINT "Handicap_campaignPlayerId_fkey" FOREIGN KEY ("campaignPlayerId") REFERENCES "CampaignPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

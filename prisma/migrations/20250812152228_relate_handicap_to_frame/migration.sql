-- AlterTable
ALTER TABLE "Frame" ADD COLUMN     "awayPlayerHandicapId" TEXT,
ADD COLUMN     "homePlayerHandicapId" TEXT;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_homePlayerHandicapId_fkey" FOREIGN KEY ("homePlayerHandicapId") REFERENCES "Handicap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_awayPlayerHandicapId_fkey" FOREIGN KEY ("awayPlayerHandicapId") REFERENCES "Handicap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

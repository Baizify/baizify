import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
     try {
          await prisma.teamCampaign.deleteMany({
               where: { campaignId: (await params).id }
          });

          await prisma.leagueCampaign.deleteMany({
               where: { campaignId: (await params).id }
          });

          await prisma.campaign.delete({
               where: { id: (await params).id }
          });

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error deleting campaign:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
     }
}
import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get all handicaps for the player across all campaigns
    const handicaps = await prisma.handicap.findMany({
      where: {
        campaignPlayer: {
          userId: id
        }
      },
      include: {
        campaignPlayer: {
          include: {
            campaign: {
              include: {
                competition: true,
                season: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group handicaps by campaign for the chart
    const handicapsByCampaign = handicaps.reduce((acc, handicap) => {
      const campaignKey = `${handicap.campaignPlayer.campaign.competition.name} - ${handicap.campaignPlayer.campaign.season.name}`;
      
      if (!acc[campaignKey]) {
        acc[campaignKey] = [];
      }
      
      acc[campaignKey].push({
        date: handicap.createdAt,
        value: handicap.value,
        campaignId: handicap.campaignPlayer.campaignId
      });
      
      return acc;
    }, {} as Record<string, Array<{ date: Date; value: number; campaignId: string }>>);

    await prisma.$disconnect();
    return NextResponse.json({ handicapsByCampaign });
  } catch (error) {
    console.error('Error fetching player handicaps:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to fetch player handicaps' }, { status: 500 });
  }
}
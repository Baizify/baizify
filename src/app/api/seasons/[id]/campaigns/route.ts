import { Season } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { seasonId: (await params).id },
      include: {
        teamCampaign: {
          include: {
            team: true
          }
        },
        leagueCampaign: true
      },
      orderBy: { createdAt: 'desc' }
    });

    await prisma.$disconnect();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { campaignType, teamId, competitionId } = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        seasonId: (await params).id,
        competitionId
      }
    });

    if (campaignType === 'team' && teamId) {
      await prisma.teamCampaign.create({
        data: {
          campaignId: campaign.id,
          teamId: teamId
        }
      });
    } else if (campaignType === 'league') {
      await prisma.leagueCampaign.create({
        data: {
          campaignId: campaign.id
        }
      });
    }

    const createdCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        teamCampaign: {
          include: {
            team: true
          }
        },
        leagueCampaign: true
      }
    });

    await prisma.$disconnect();
    return NextResponse.json({ 
      success: true, 
      campaign: createdCampaign,
      message: 'Campaign created successfully' 
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to create campaign',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
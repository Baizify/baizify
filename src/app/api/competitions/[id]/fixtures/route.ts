import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get('seasonId');

  try {
    const fixtures = await prisma.fixture.findMany({
      where: {
        competitionId: params.id,
        ...(seasonId && { seasonId })
      },
      include: {
        competition: true,
        season: true,
        homeCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        },
        awayCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        },
        frames: {
          orderBy: {
            frameNumber: 'asc'
          }
        },
        _count: {
          select: {
            frames: true
          }
        }
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    await prisma.$disconnect();
    return NextResponse.json(fixtures);
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to fetch fixtures' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data: {
      seasonId: string;
      homeCampaignId: string;
      awayCampaignId: string;
      scheduledDate?: string;
      venue?: string;
      notes?: string;
    } = await request.json();

    const fixture = await prisma.fixture.create({
      data: {
        competitionId: params.id,
        seasonId: data.seasonId,
        homeCampaignId: data.homeCampaignId,
        awayCampaignId: data.awayCampaignId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        venue: data.venue,
        notes: data.notes
      },
      include: {
        competition: true,
        season: true,
        homeCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        },
        awayCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        }
      }
    });

    await prisma.$disconnect();
    return NextResponse.json(fixture);
  } catch (error) {
    console.error('Error creating fixture:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to create fixture' }, { status: 500 });
  }
}
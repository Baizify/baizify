import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isLive } = await request.json();

    const fixture = await prisma.fixture.update({
      where: { id: params.id },
      data: { 
        isLive: Boolean(isLive),
        status: isLive ? "in_progress" : "scheduled"
      },
      include: {
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
        _count: {
          select: {
            frames: true
          }
        }
      }
    });

    await prisma.$disconnect();
    return NextResponse.json({ 
      success: true, 
      fixture,
      message: `Fixture ${isLive ? 'started' : 'stopped'} live status successfully` 
    });
  } catch (error) {
    console.error('Error updating fixture live status:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to update fixture live status',
      details: error.message 
    }, { status: 500 });
  }
}
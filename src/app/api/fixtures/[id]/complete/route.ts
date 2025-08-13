import prisma from "@/providers/prisma";
import { processFixtureCompletion } from "@/lib/fixtureUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Manually trigger fixture completion processing
    await processFixtureCompletion((await params).id);

    // Return updated fixture with completion status
    const fixture = await prisma.fixture.findUnique({
      where: { id: (await params).id },
      include: {
        homeCampaign: {
          include: {
            leagueCampaign: true,
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        },
        awayCampaign: {
          include: {
            leagueCampaign: true,
            teamCampaign: {
              include: {
                team: true
              }
            }
          }
        },
        frames: {
          where: { status: "completed" },
          orderBy: { frameNumber: "asc" }
        }
      }
    });

    await prisma.$disconnect();
    return NextResponse.json({ 
      success: true, 
      fixture,
      message: "Fixture completion processed successfully" 
    });
  } catch (error) {
    console.error('Error processing fixture completion:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to process fixture completion',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
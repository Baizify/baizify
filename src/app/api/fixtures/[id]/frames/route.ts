import prisma from "@/providers/prisma";
import { processFixtureCompletion } from "@/lib/fixtureUtils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const frames = await prisma.frame.findMany({
      where: {
        fixtureId: (await params).id
      },
      include: {
        homePlayer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        awayPlayer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        winner: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        homePlayerHandicap: true,
        awayPlayerHandicap: true
      },
      orderBy: {
        frameNumber: 'asc'
      }
    });

    await prisma.$disconnect();
    return NextResponse.json(frames);
  } catch (error) {
    console.error('Error fetching frames:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to fetch frames' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: {
      frameNumber: number;
      homePlayerId?: string;
      homePlayerHandicapId?: string;
      awayPlayerId?: string;
      awayPlayerHandicapId?: string;
      homeScore?: number;
      awayScore?: number;
      winnerId?: string;
      status?: string;
      notes?: string;
    } = await request.json();

    const frame = await prisma.frame.create({
      data: {
        fixtureId: (await params).id,
        frameNumber: data.frameNumber,
        homePlayerId: data.homePlayerId || null,
        homePlayerHandicapId: data.homePlayerHandicapId || null,
        awayPlayerId: data.awayPlayerId || null,
        awayPlayerHandicapId: data.awayPlayerHandicapId || null,
        homeScore: data.homeScore || 0,
        awayScore: data.awayScore || 0,
        winnerId: data.winnerId || null,
        status: data.status || 'not_started',
        notes: data.notes || null
      },
      include: {
        homePlayer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        awayPlayer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        winner: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        homePlayerHandicap: true,
        awayPlayerHandicap: true
      }
    });

    // Process fixture completion after frame creation
    await processFixtureCompletion((await params).id);

    await prisma.$disconnect();
    return NextResponse.json(frame);
  } catch (error) {
    console.error('Error creating frame:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to create frame' }, { status: 500 });
  }
}
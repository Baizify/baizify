import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: (await params).id },
      include: {
        competition: true,
        season: true,
        homeCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            },
            players: {
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
            }
          }
        },
        awayCampaign: {
          include: {
            teamCampaign: {
              include: {
                team: true
              }
            },
            players: {
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
            }
          }
        },
        frames: {
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
            }
          },
          orderBy: {
            frameNumber: 'asc'
          }
        }
      }
    });

    if (!fixture) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    await prisma.$disconnect();
    return NextResponse.json(fixture);
  } catch (error) {
    console.error('Error fetching fixture:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to fetch fixture' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: {
      scheduledDate?: string;
      actualDate?: string;
      homeScore?: number;
      awayScore?: number;
      status?: string;
      venue?: string;
      notes?: string;
      totalFrames?: number;
    } = await request.json();

    // Validate the fixture exists
    const existingFixture = await prisma.fixture.findUnique({
      where: { id: (await params).id }
    });

    if (!existingFixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    // Validate status if provided
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        validStatuses 
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (data.scheduledDate !== undefined) {
      updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
    }
    if (data.actualDate !== undefined) {
      updateData.actualDate = data.actualDate ? new Date(data.actualDate) : null;
    }
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Update completion status based on new status
      updateData.isCompleted = data.status === 'completed';
      if (data.status === 'completed' && !existingFixture.isCompleted) {
        updateData.completedAt = new Date();
      }
    }
    if (data.venue !== undefined) updateData.venue = data.venue || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.totalFrames !== undefined) {
      if (data.totalFrames < 1 || data.totalFrames > 50) {
        return NextResponse.json({ 
          error: 'Total frames must be between 1 and 50' 
        }, { status: 400 });
      }
      updateData.totalFrames = data.totalFrames;
    }

    const fixture = await prisma.fixture.update({
      where: { id: (await params).id },
      data: updateData,
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
    return NextResponse.json({ 
      success: true, 
      fixture,
      message: 'Fixture updated successfully' 
    });
  } catch (error) {
    console.error('Error updating fixture:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to update fixture',
      details: (error as { message: any }).message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.fixture.delete({
      where: { id: (await params).id }
    });

    await prisma.$disconnect();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fixture:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 });
  }
}
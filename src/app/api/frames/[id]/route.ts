import prisma from "@/providers/prisma";
import { processFixtureCompletion } from "@/lib/fixtureUtils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data: {
      homePlayerId?: string;
      awayPlayerId?: string;
      homeScore?: number;
      awayScore?: number;
      winnerId?: string;
      status?: string;
      notes?: string;
    } = await request.json();

    const updateData: any = {};
    
    if (data.homePlayerId !== undefined) updateData.homePlayerId = data.homePlayerId || null;
    if (data.awayPlayerId !== undefined) updateData.awayPlayerId = data.awayPlayerId || null;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.winnerId !== undefined) updateData.winnerId = data.winnerId || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    const frame = await prisma.frame.update({
      where: { id: params.id },
      data: updateData,
      include: {
        fixture: {
          select: { id: true }
        },
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
      }
    });

    // Process fixture completion after frame update
    if (frame.fixtureId) {
      await processFixtureCompletion(frame.fixtureId);
    }

    await prisma.$disconnect();
    return NextResponse.json(frame);
  } catch (error) {
    console.error('Error updating frame:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to update frame' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.frame.delete({
      where: { id: params.id }
    });

    await prisma.$disconnect();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting frame:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Failed to delete frame' }, { status: 500 });
  }
}
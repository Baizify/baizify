import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/providers/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        // Get recent fixtures where the player participated
        const fixtures = await prisma.fixture.findMany({
            where: {
                frames: {
                    some: {
                        OR: [
                            { homePlayerId: id },
                            { awayPlayerId: id }
                        ]
                    }
                }
            },
            include: {
                homeCampaign: {
                    include: {
                        teamCampaign: {
                            include: {
                                team: {
                                    select: {
                                        id: true,
                                        name: true
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
                                team: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                competition: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                season: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                frames: {
                    where: {
                        OR: [
                            { homePlayerId: id },
                            { awayPlayerId: id }
                        ]
                    },
                    select: {
                        id: true,
                        frameNumber: true,
                        homeScore: true,
                        awayScore: true,
                        winnerId: true,
                        status: true,
                        homePlayerId: true,
                        awayPlayerId: true
                    },
                    orderBy: {
                        frameNumber: 'asc'
                    }
                }
            },
            orderBy: [
                { scheduledDate: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit
        });

        // Transform the data to include player-specific information
        const recentMatches = fixtures.map((fixture: any) => ({
            ...fixture,
            playerFrames: fixture.frames.map(frame => ({
                ...frame,
                isPlayerHome: frame.homePlayerId === id
            }))
        }));

        await prisma.$disconnect();
        return NextResponse.json(recentMatches);

    } catch (error) {
        console.error('Error fetching recent matches:', error);
        await prisma.$disconnect();
        return NextResponse.json(
            { error: 'Failed to fetch recent matches' },
            { status: 500 }
        );
    }
}
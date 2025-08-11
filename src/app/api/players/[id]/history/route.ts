import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/providers/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const filter = searchParams.get('filter') || 'all';
        const skip = (page - 1) * limit;

        // Base where clause for fixtures where player participated
        let whereClause: any = {
            frames: {
                some: {
                    OR: [
                        { homePlayerId: id },
                        { awayPlayerId: id }
                    ]
                }
            }
        };

        // Add filter conditions
        switch (filter) {
            case 'completed':
                whereClause.status = 'completed';
                break;
            case 'wins':
            case 'losses':
                // For wins/losses, we need to calculate this post-query
                // as it requires aggregating frame results
                whereClause.status = 'completed';
                break;
        }

        // Get fixtures with pagination
        const [fixtures, totalCount] = await Promise.all([
            prisma.fixture.findMany({
                where: whereClause,
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
                skip,
                take: limit
            }),
            prisma.fixture.count({
                where: whereClause
            })
        ]);

        // Transform and filter data based on wins/losses if needed
        let filteredFixtures = fixtures.map(fixture => ({
            ...fixture,
            playerFrames: fixture.frames.map(frame => ({
                ...frame,
                isPlayerHome: frame.homePlayerId === id
            }))
        }));

        // Apply win/loss filtering
        if (filter === 'wins' || filter === 'losses') {
            filteredFixtures = filteredFixtures.filter(fixture => {
                if (fixture.status !== 'completed') return false;
                
                const playerFramesWon = fixture.frames.filter(frame => frame.winnerId === id).length;
                const totalFrames = fixture.frames.length;
                const opponentFramesWon = totalFrames - playerFramesWon;
                
                const isWin = playerFramesWon > opponentFramesWon;
                return filter === 'wins' ? isWin : !isWin;
            });
        }

        const totalPages = Math.ceil(totalCount / limit);

        const response = {
            matches: filteredFixtures,
            totalCount,
            currentPage: page,
            totalPages
        };

        await prisma.$disconnect();
        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching player history:', error);
        await prisma.$disconnect();
        return NextResponse.json(
            { error: 'Failed to fetch player history' },
            { status: 500 }
        );
    }
}
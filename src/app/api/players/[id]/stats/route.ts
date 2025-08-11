import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/providers/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get all frames where the player participated
        const frames = await prisma.frame.findMany({
            where: {
                OR: [
                    { homePlayerId: id },
                    { awayPlayerId: id }
                ],
                status: 'completed'
            },
            include: {
                fixture: {
                    select: {
                        id: true,
                        status: true,
                        scheduledDate: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate statistics
        let wins = 0;
        let losses = 0;
        let framesWon = 0;
        let framesLost = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        let lastResult: 'win' | 'loss' | null = null;

        // Group frames by fixture to calculate match results
        const fixtureGroups = new Map();
        frames.forEach(frame => {
            const fixtureId = frame.fixture.id;
            if (!fixtureGroups.has(fixtureId)) {
                fixtureGroups.set(fixtureId, []);
            }
            fixtureGroups.get(fixtureId).push(frame);
        });

        // Calculate match wins/losses and frame statistics
        fixtureGroups.forEach(fixtureFrames => {
            let playerFramesWon = 0;
            let opponentFramesWon = 0;

            fixtureFrames.forEach(frame => {
                if (frame.winnerId === id) {
                    framesWon++;
                    playerFramesWon++;
                } else if (frame.winnerId) {
                    framesLost++;
                    opponentFramesWon++;
                }
            });

            // Determine match result
            if (playerFramesWon > opponentFramesWon) {
                wins++;
                if (lastResult === 'win') {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                    lastResult = 'win';
                }
            } else if (opponentFramesWon > playerFramesWon) {
                losses++;
                if (lastResult === 'loss') {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                    lastResult = 'loss';
                }
            }

            // Update best streak
            if (tempStreak > Math.abs(bestStreak)) {
                bestStreak = lastResult === 'win' ? tempStreak : -tempStreak;
            }
        });

        // Current streak is the most recent streak
        currentStreak = lastResult === 'win' ? tempStreak : (lastResult === 'loss' ? -tempStreak : 0);

        const totalMatches = wins + losses;
        const totalFrames = framesWon + framesLost;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
        const frameWinRate = totalFrames > 0 ? (framesWon / totalFrames) * 100 : 0;
        const averageFramesPerMatch = totalMatches > 0 ? totalFrames / totalMatches : 0;

        const stats = {
            totalMatches,
            wins,
            losses,
            framesWon,
            framesLost,
            winRate,
            frameWinRate,
            currentStreak,
            bestStreak: Math.abs(bestStreak),
            averageFramesPerMatch
        };

        await prisma.$disconnect();
        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching player stats:', error);
        await prisma.$disconnect();
        return NextResponse.json(
            { error: 'Failed to fetch player statistics' },
            { status: 500 }
        );
    }
}
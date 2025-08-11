import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/providers/prisma';

interface Achievement {
    id: string;
    title: string;
    description: string;
    type: 'trophy' | 'milestone' | 'streak' | 'skill' | 'special';
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    icon: string;
    dateEarned?: string;
    progress?: {
        current: number;
        target: number;
    };
}

// Define available achievements
const AVAILABLE_ACHIEVEMENTS: Omit<Achievement, 'dateEarned' | 'progress'>[] = [
    {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first match',
        type: 'milestone',
        level: 'bronze',
        icon: '🏆'
    },
    {
        id: 'win_streak_3',
        title: 'Hot Streak',
        description: 'Win 3 matches in a row',
        type: 'streak',
        level: 'silver',
        icon: '🔥'
    },
    {
        id: 'win_streak_5',
        title: 'Unstoppable',
        description: 'Win 5 matches in a row',
        type: 'streak',
        level: 'gold',
        icon: '⚡'
    },
    {
        id: 'win_streak_10',
        title: 'Legendary',
        description: 'Win 10 matches in a row',
        type: 'streak',
        level: 'platinum',
        icon: '👑'
    },
    {
        id: 'matches_10',
        title: 'Getting Started',
        description: 'Play 10 matches',
        type: 'milestone',
        level: 'bronze',
        icon: '🎯'
    },
    {
        id: 'matches_50',
        title: 'Experienced',
        description: 'Play 50 matches',
        type: 'milestone',
        level: 'silver',
        icon: '🎖️'
    },
    {
        id: 'matches_100',
        title: 'Veteran',
        description: 'Play 100 matches',
        type: 'milestone',
        level: 'gold',
        icon: '🏅'
    },
    {
        id: 'frames_100',
        title: 'Frame Master',
        description: 'Win 100 frames',
        type: 'skill',
        level: 'silver',
        icon: '🎱'
    },
    {
        id: 'frames_500',
        title: 'Frame Legend',
        description: 'Win 500 frames',
        type: 'skill',
        level: 'gold',
        icon: '⭐'
    },
    {
        id: 'perfect_match',
        title: 'Perfect Game',
        description: 'Win a match without losing a frame',
        type: 'skill',
        level: 'gold',
        icon: '💎'
    },
    {
        id: 'campaign_winner',
        title: 'Champion',
        description: 'Win a campaign',
        type: 'trophy',
        level: 'gold',
        icon: '🥇'
    }
];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get player statistics for achievement calculation
        const [frames, fixtures, campaigns] = await Promise.all([
            // Get all frames where player participated
            prisma.frame.findMany({
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
                    createdAt: 'asc'
                }
            }),
            // Get all fixtures where player participated
            prisma.fixture.findMany({
                where: {
                    frames: {
                        some: {
                            OR: [
                                { homePlayerId: id },
                                { awayPlayerId: id }
                            ]
                        }
                    },
                    status: 'completed'
                },
                include: {
                    frames: {
                        where: {
                            OR: [
                                { homePlayerId: id },
                                { awayPlayerId: id }
                            ]
                        }
                    }
                },
                orderBy: {
                    scheduledDate: 'asc'
                }
            }),
            // Get player campaigns (for potential campaign-based achievements)
            prisma.campaignPlayer.findMany({
                where: { userId: id },
                include: {
                    campaign: {
                        include: {
                            leagueCampaign: true
                        }
                    }
                }
            })
        ]);

        // Calculate statistics
        const framesWon = frames.filter(f => f.winnerId === id).length;
        
        // Calculate match results and streaks
        const matchResults: boolean[] = [];
        const fixtureGroups = new Map();
        
        frames.forEach(frame => {
            const fixtureId = frame.fixture.id;
            if (!fixtureGroups.has(fixtureId)) {
                fixtureGroups.set(fixtureId, []);
            }
            fixtureGroups.get(fixtureId).push(frame);
        });

        fixtures.forEach(fixture => {
            const playerFramesWon = fixture.frames.filter(f => f.winnerId === id).length;
            const totalFrames = fixture.frames.length;
            const opponentFramesWon = totalFrames - playerFramesWon;
            matchResults.push(playerFramesWon > opponentFramesWon);
        });

        // Calculate streaks
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        let perfectMatches = 0;

        for (let i = matchResults.length - 1; i >= 0; i--) {
            const isWin = matchResults[i];
            
            // Current streak (from most recent)
            if (i === matchResults.length - 1) {
                currentStreak = isWin ? 1 : 0;
                tempStreak = isWin ? 1 : 0;
            } else {
                if (isWin && tempStreak > 0) {
                    tempStreak++;
                    if (i === matchResults.length - currentStreak - 1) {
                        currentStreak = tempStreak;
                    }
                } else {
                    tempStreak = isWin ? 1 : 0;
                    if (i === matchResults.length - 1) {
                        currentStreak = tempStreak;
                    }
                }
            }
            
            bestStreak = Math.max(bestStreak, tempStreak);
        }

        // Check for perfect matches
        fixtures.forEach(fixture => {
            const playerFramesWon = fixture.frames.filter(f => f.winnerId === id).length;
            const totalFrames = fixture.frames.length;
            const opponentFramesWon = totalFrames - playerFramesWon;
            
            if (playerFramesWon > opponentFramesWon && opponentFramesWon === 0) {
                perfectMatches++;
            }
        });

        const totalMatches = matchResults.length;
        const totalWins = matchResults.filter(r => r).length;

        // Check achievements
        const earned: Achievement[] = [];
        const inProgress: Achievement[] = [];

        AVAILABLE_ACHIEVEMENTS.forEach(achievement => {
            let isEarned = false;
            let progress: { current: number; target: number } | undefined;

            switch (achievement.id) {
                case 'first_win':
                    isEarned = totalWins >= 1;
                    if (!isEarned) progress = { current: totalWins, target: 1 };
                    break;
                case 'win_streak_3':
                    isEarned = bestStreak >= 3;
                    if (!isEarned) progress = { current: Math.max(currentStreak, bestStreak), target: 3 };
                    break;
                case 'win_streak_5':
                    isEarned = bestStreak >= 5;
                    if (!isEarned) progress = { current: Math.max(currentStreak, bestStreak), target: 5 };
                    break;
                case 'win_streak_10':
                    isEarned = bestStreak >= 10;
                    if (!isEarned) progress = { current: Math.max(currentStreak, bestStreak), target: 10 };
                    break;
                case 'matches_10':
                    isEarned = totalMatches >= 10;
                    if (!isEarned) progress = { current: totalMatches, target: 10 };
                    break;
                case 'matches_50':
                    isEarned = totalMatches >= 50;
                    if (!isEarned) progress = { current: totalMatches, target: 50 };
                    break;
                case 'matches_100':
                    isEarned = totalMatches >= 100;
                    if (!isEarned) progress = { current: totalMatches, target: 100 };
                    break;
                case 'frames_100':
                    isEarned = framesWon >= 100;
                    if (!isEarned) progress = { current: framesWon, target: 100 };
                    break;
                case 'frames_500':
                    isEarned = framesWon >= 500;
                    if (!isEarned) progress = { current: framesWon, target: 500 };
                    break;
                case 'perfect_match':
                    isEarned = perfectMatches >= 1;
                    if (!isEarned) progress = { current: perfectMatches, target: 1 };
                    break;
                case 'campaign_winner':
                    // This would need more complex logic to check campaign standings
                    isEarned = false;
                    progress = { current: 0, target: 1 };
                    break;
            }

            const achievementWithProgress: Achievement = {
                ...achievement,
                ...(isEarned && { dateEarned: new Date().toISOString() }), // In a real app, store actual earn dates
                ...(progress && { progress })
            };

            if (isEarned) {
                earned.push(achievementWithProgress);
            } else {
                inProgress.push(achievementWithProgress);
            }
        });

        const response = {
            earned,
            inProgress,
            totalEarned: earned.length,
            totalPossible: AVAILABLE_ACHIEVEMENTS.length
        };

        await prisma.$disconnect();
        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching player achievements:', error);
        await prisma.$disconnect();
        return NextResponse.json(
            { error: 'Failed to fetch player achievements' },
            { status: 500 }
        );
    }
}
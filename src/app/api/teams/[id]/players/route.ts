import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teamId = (await params).id;

    // Get all campaigns for this team with player data
    const teamCampaigns = await prisma.teamCampaign.findMany({
      where: { teamId },
      include: {
        campaign: {
          include: {
            players: {
              include: {
                user: true,
                homeFrames: {
                  include: {
                    fixture: true
                  }
                },
                awayFrames: {
                  include: {
                    fixture: true
                  }
                },
                wonFrames: {
                  include: {
                    fixture: true
                  }
                }
              }
            },
            homeFixtures: {
              include: {
                frames: true
              }
            },
            awayFixtures: {
              include: {
                frames: true
              }
            }
          }
        }
      }
    });

    // Aggregate player statistics
    const playerStats = {};

    teamCampaigns.forEach(teamCampaign => {
      teamCampaign.campaign.players.forEach(player => {
        const playerId = player.id;
        const userId = player.userId;
        const userName = player.user.name || player.user.email;

        if (!playerStats[userId]) {
          playerStats[userId] = {
            id: userId,
            name: userName,
            email: player.user.email,
            campaigns: 0,
            framesPlayed: 0,
            framesWon: 0,
            framesLost: 0,
            winPercentage: 0,
            averageScore: 0,
            totalScore: 0,
            highestScore: 0,
            recentActivity: [],
            seasonsActive: new Set(),
            competitionsPlayed: new Set()
          };
        }

        const stats = playerStats[userId];
        stats.campaigns++;
        stats.seasonsActive.add(teamCampaign.campaign.seasonId);
        stats.competitionsPlayed.add(teamCampaign.campaign.competitionId);

        // Count frames played (home + away)
        const framesPlayedAsHome = player.homeFrames.length;
        const framesPlayedAsAway = player.awayFrames.length;
        const totalFramesPlayed = framesPlayedAsHome + framesPlayedAsAway;
        stats.framesPlayed += totalFramesPlayed;

        // Count frames won
        const framesWon = player.wonFrames.length;
        stats.framesWon += framesWon;
        stats.framesLost += (totalFramesPlayed - framesWon);

        // Calculate scores
        player.homeFrames.forEach(frame => {
          stats.totalScore += frame.homeScore;
          if (frame.homeScore > stats.highestScore) {
            stats.highestScore = frame.homeScore;
          }
          
          // Add to recent activity
          stats.recentActivity.push({
            date: frame.createdAt,
            type: 'frame',
            score: frame.homeScore,
            result: frame.winnerId === playerId ? 'won' : 'lost'
          });
        });

        player.awayFrames.forEach(frame => {
          stats.totalScore += frame.awayScore;
          if (frame.awayScore > stats.highestScore) {
            stats.highestScore = frame.awayScore;
          }
          
          stats.recentActivity.push({
            date: frame.createdAt,
            type: 'frame',
            score: frame.awayScore,
            result: frame.winnerId === playerId ? 'won' : 'lost'
          });
        });
      });
    });

    // Convert to array and calculate final stats
    const playersArray = Object.values(playerStats).map((player: any) => ({
      ...player,
      winPercentage: player.framesPlayed > 0 
        ? Math.round((player.framesWon / player.framesPlayed) * 100) 
        : 0,
      averageScore: player.framesPlayed > 0 
        ? Math.round((player.totalScore / player.framesPlayed) * 10) / 10
        : 0,
      seasonsActive: player.seasonsActive.size,
      competitionsPlayed: player.competitionsPlayed.size,
      recentActivity: player.recentActivity
        .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
        .slice(0, 5) // Last 5 activities
    }));

    // Sort by different criteria for top performers
    const topByWinPercentage = [...playersArray]
      .filter(p => p.framesPlayed >= 5) // Min 5 frames for meaningful stats
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .slice(0, 10);

    const topByFramesWon = [...playersArray]
      .sort((a, b) => b.framesWon - a.framesWon)
      .slice(0, 10);

    const topByAverageScore = [...playersArray]
      .filter(p => p.framesPlayed >= 5)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    const mostActive = [...playersArray]
      .sort((a, b) => b.framesPlayed - a.framesPlayed)
      .slice(0, 10);

    const response = {
      allPlayers: playersArray,
      topPerformers: {
        byWinPercentage: topByWinPercentage,
        byFramesWon: topByFramesWon,
        byAverageScore: topByAverageScore,
        mostActive: mostActive
      },
      summary: {
        totalPlayers: playersArray.length,
        activePlayers: playersArray.filter(p => p.recentActivity.length > 0).length,
        totalFramesPlayed: playersArray.reduce((sum, p) => sum + p.framesPlayed, 0),
        totalFramesWon: playersArray.reduce((sum, p) => sum + p.framesWon, 0)
      }
    };

    await prisma.$disconnect();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching team players:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch team players',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
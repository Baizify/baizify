import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teamId = (await params).id;

    // Get basic team info
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        campaigns: {
          include: {
            campaign: {
              include: {
                season: true,
                competition: true,
                homeFixtures: {
                  include: {
                    frames: {
                      include: {
                        homePlayer: { include: { user: true } },
                        awayPlayer: { include: { user: true } },
                        winner: { include: { user: true } }
                      }
                    }
                  }
                },
                awayFixtures: {
                  include: {
                    frames: {
                      include: {
                        homePlayer: { include: { user: true } },
                        awayPlayer: { include: { user: true } },
                        winner: { include: { user: true } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Calculate statistics
    const stats = {
      totalCampaigns: team.campaigns.length,
      activeCampaigns: 0,
      totalFixtures: 0,
      totalFrames: 0,
      framesWon: 0,
      framesLost: 0,
      fixturesWon: 0,
      fixturesLost: 0,
      fixturesDrawn: 0,
      currentSeasons: new Set(),
      allTimeRecord: {
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        winPercentage: 0
      }
    };

    // Process each campaign
    for (const teamCampaign of team.campaigns) {
      const campaign = teamCampaign.campaign;
      
      // Check if campaign is in current year (active)
      const currentYear = new Date().getFullYear();
      const campaignYear = new Date(campaign.createdAt).getFullYear();
      if (campaignYear === currentYear) {
        stats.activeCampaigns++;
        stats.currentSeasons.add(campaign.season.name);
      }

      // Count fixtures where this team participated
      const homeFixtures = campaign.homeFixtures || [];
      const awayFixtures = campaign.awayFixtures || [];
      const allFixtures = [...homeFixtures, ...awayFixtures];
      
      stats.totalFixtures += allFixtures.length;

      // Process each fixture
      for (const fixture of allFixtures) {
        if (fixture.isCompleted) {
          const isHome = campaign.homeFixtures?.includes(fixture);
          const teamScore = isHome ? fixture.homeScore : fixture.awayScore;
          const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;

          if (teamScore > opponentScore) {
            stats.fixturesWon++;
          } else if (teamScore < opponentScore) {
            stats.fixturesLost++;
          } else {
            stats.fixturesDrawn++;
          }

          // Count frames
          for (const frame of fixture.frames) {
            stats.totalFrames++;
            
            // Determine if this team won the frame
            if (frame.winner) {
              const winnerCampaign = frame.winner.campaignId;
              if (winnerCampaign === campaign.id) {
                stats.framesWon++;
              } else {
                stats.framesLost++;
              }
            }
          }
        }
      }
    }

    // Calculate all-time record
    stats.allTimeRecord.played = stats.fixturesWon + stats.fixturesLost + stats.fixturesDrawn;
    stats.allTimeRecord.won = stats.fixturesWon;
    stats.allTimeRecord.lost = stats.fixturesLost;
    stats.allTimeRecord.drawn = stats.fixturesDrawn;
    stats.allTimeRecord.winPercentage = stats.allTimeRecord.played > 0 
      ? Math.round((stats.fixturesWon / stats.allTimeRecord.played) * 100) 
      : 0;

    const response = {
      teamName: team.name,
      ...stats,
      frameWinPercentage: stats.totalFrames > 0 ? Math.round((stats.framesWon / stats.totalFrames) * 100) : 0
    };

    await prisma.$disconnect();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch team statistics',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
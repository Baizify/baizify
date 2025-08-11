import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

    // Get team campaigns to find all fixtures
    const teamCampaigns = await prisma.teamCampaign.findMany({
      where: { teamId },
      include: {
        campaign: {
          include: {
            homeFixtures: {
              where: { isCompleted: true },
              include: {
                competition: true,
                season: true,
                awayCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                },
                frames: {
                  include: {
                    homePlayer: { include: { user: true } },
                    awayPlayer: { include: { user: true } },
                    winner: { include: { user: true } }
                  }
                }
              },
              orderBy: { completedAt: 'desc' }
            },
            awayFixtures: {
              where: { isCompleted: true },
              include: {
                competition: true,
                season: true,
                homeCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                },
                frames: {
                  include: {
                    homePlayer: { include: { user: true } },
                    awayPlayer: { include: { user: true } },
                    winner: { include: { user: true } }
                  }
                }
              },
              orderBy: { completedAt: 'desc' }
            }
          }
        }
      }
    });

    // Combine and process fixtures
    const allFixtures = [];
    
    teamCampaigns.forEach(teamCampaign => {
      // Add home fixtures
      teamCampaign.campaign.homeFixtures.forEach(fixture => {
        allFixtures.push({
          ...fixture,
          isHome: true,
          teamScore: fixture.homeScore,
          opponentScore: fixture.awayScore,
          opponent: fixture.awayCampaign?.teamCampaign?.team || null,
          result: fixture.homeScore > fixture.awayScore ? 'W' : 
                  fixture.homeScore < fixture.awayScore ? 'L' : 'D'
        });
      });

      // Add away fixtures
      teamCampaign.campaign.awayFixtures.forEach(fixture => {
        allFixtures.push({
          ...fixture,
          isHome: false,
          teamScore: fixture.awayScore,
          opponentScore: fixture.homeScore,
          opponent: fixture.homeCampaign?.teamCampaign?.team || null,
          result: fixture.awayScore > fixture.homeScore ? 'W' : 
                  fixture.awayScore < fixture.homeScore ? 'L' : 'D'
        });
      });
    });

    // Sort by completion date and take last 10
    const recentFixtures = allFixtures
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .map(fixture => ({
        id: fixture.id,
        competition: fixture.competition,
        season: fixture.season,
        opponent: fixture.opponent,
        isHome: fixture.isHome,
        teamScore: fixture.teamScore,
        opponentScore: fixture.opponentScore,
        result: fixture.result,
        completedAt: fixture.completedAt,
        venue: fixture.venue,
        frames: fixture.frames.map(frame => ({
          id: frame.id,
          frameNumber: frame.frameNumber,
          homeScore: frame.homeScore,
          awayScore: frame.awayScore,
          homePlayer: frame.homePlayer?.user.name,
          awayPlayer: frame.awayPlayer?.user.name,
          winner: frame.winner?.user.name,
          status: frame.status
        }))
      }));

    await prisma.$disconnect();
    return NextResponse.json(recentFixtures);
  } catch (error) {
    console.error('Error fetching recent fixtures:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch recent fixtures',
      details: error.message 
    }, { status: 500 });
  }
}
import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teamId = (await params).id;
    const currentYear = new Date().getFullYear();

    const currentCampaigns = await prisma.teamCampaign.findMany({
      where: { teamId },
      include: {
        team: true,
        campaign: {
          include: {
            season: true,
            competition: true,
            homeFixtures: {
              include: {
                awayCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                },
                frames: true
              }
            },
            awayFixtures: {
              include: {
                homeCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                },
                frames: true
              }
            },
            players: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        campaign: {
          createdAt: 'desc'
        }
      }
    });

    // Filter campaigns created in current year (active campaigns)
    const activeCampaigns = currentCampaigns.filter(tc => 
      new Date(tc.campaign.createdAt).getFullYear() === currentYear
    );

    const campaignsWithStats = activeCampaigns.map(teamCampaign => {
      const campaign = teamCampaign.campaign;
      const allFixtures = [...campaign.homeFixtures, ...campaign.awayFixtures];
      const completedFixtures = allFixtures.filter(f => f.isCompleted);
      
      let wins = 0, losses = 0, draws = 0;
      let framesFor = 0, framesAgainst = 0;

      completedFixtures.forEach((fixture: any) => {
        const isHome = campaign.homeFixtures.includes(fixture);
        const teamScore = isHome ? fixture.homeScore : fixture.awayScore;
        const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;

        framesFor += teamScore;
        framesAgainst += opponentScore;

        if (teamScore > opponentScore) wins++;
        else if (teamScore < opponentScore) losses++;
        else draws++;
      });

      return {
        id: campaign.id,
        competition: campaign.competition,
        season: campaign.season,
        record: {
          played: completedFixtures.length,
          won: wins,
          lost: losses,
          drawn: draws,
          winPercentage: completedFixtures.length > 0 ? Math.round((wins / completedFixtures.length) * 100) : 0
        },
        frames: {
          for: framesFor,
          against: framesAgainst,
          difference: framesFor - framesAgainst
        },
        players: campaign.players,
        totalFixtures: allFixtures.length,
        upcomingFixtures: allFixtures.filter(f => !f.isCompleted && f.status !== 'cancelled').length,
        recentForm: completedFixtures
          .slice(-5)
          .map((fixture: any) => {
            const isHome = campaign.homeFixtures.includes(fixture);
            const teamScore = isHome ? fixture.homeScore : fixture.awayScore;
            const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;
            
            if (teamScore > opponentScore) return 'W';
            if (teamScore < opponentScore) return 'L';
            return 'D';
          })
          .reverse()
      };
    });

    await prisma.$disconnect();
    return NextResponse.json(campaignsWithStats);
  } catch (error) {
    console.error('Error fetching current campaigns:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch current campaigns',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
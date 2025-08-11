import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    const currentYear = new Date().getFullYear();

    const historicCampaigns = await prisma.teamCampaign.findMany({
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

    // Filter campaigns from previous years (historic campaigns)
    const pastCampaigns = historicCampaigns.filter(tc => 
      new Date(tc.campaign.createdAt).getFullYear() < currentYear
    );

    const campaignsWithStats = pastCampaigns.map(teamCampaign => {
      const campaign = teamCampaign.campaign;
      const allFixtures = [...campaign.homeFixtures, ...campaign.awayFixtures];
      const completedFixtures = allFixtures.filter(f => f.isCompleted);
      
      let wins = 0, losses = 0, draws = 0;
      let framesFor = 0, framesAgainst = 0;

      completedFixtures.forEach(fixture => {
        const isHome = campaign.homeFixtures.includes(fixture);
        const teamScore = isHome ? fixture.homeScore : fixture.awayScore;
        const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;

        framesFor += teamScore;
        framesAgainst += opponentScore;

        if (teamScore > opponentScore) wins++;
        else if (teamScore < opponentScore) losses++;
        else draws++;
      });

      // Calculate final position (simplified - would need league table logic for real position)
      const winPercentage = completedFixtures.length > 0 ? (wins / completedFixtures.length) * 100 : 0;
      let position = "N/A";
      if (winPercentage >= 80) position = "1st";
      else if (winPercentage >= 60) position = "2nd";
      else if (winPercentage >= 40) position = "3rd";
      else position = "4th+";

      return {
        id: campaign.id,
        competition: campaign.competition,
        season: campaign.season,
        year: new Date(campaign.createdAt).getFullYear(),
        record: {
          played: completedFixtures.length,
          won: wins,
          lost: losses,
          drawn: draws,
          winPercentage: Math.round(winPercentage)
        },
        frames: {
          for: framesFor,
          against: framesAgainst,
          difference: framesFor - framesAgainst
        },
        finalPosition: position,
        achievements: wins > losses ? ["Top Performer"] : []
      };
    });

    // Group by year for better organization
    const groupedByYear = campaignsWithStats.reduce((acc, campaign) => {
      const year = campaign.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(campaign);
      return acc;
    }, {});

    await prisma.$disconnect();
    return NextResponse.json({
      campaigns: campaignsWithStats,
      groupedByYear
    });
  } catch (error) {
    console.error('Error fetching historic campaigns:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch historic campaigns',
      details: error.message 
    }, { status: 500 });
  }
}
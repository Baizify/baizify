import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teamId = (await params).id;

    // Get team campaigns to find all upcoming fixtures
    const teamCampaigns = await prisma.teamCampaign.findMany({
      where: { teamId },
      include: {
        campaign: {
          include: {
            homeFixtures: {
              where: { 
                AND: [
                  { isCompleted: false },
                  { status: { not: 'cancelled' } }
                ]
              },
              include: {
                competition: true,
                season: true,
                awayCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                }
              },
              orderBy: { scheduledDate: 'asc' }
            },
            awayFixtures: {
              where: { 
                AND: [
                  { isCompleted: false },
                  { status: { not: 'cancelled' } }
                ]
              },
              include: {
                competition: true,
                season: true,
                homeCampaign: {
                  include: {
                    teamCampaign: {
                      include: { team: true }
                    }
                  }
                }
              },
              orderBy: { scheduledDate: 'asc' }
            }
          }
        }
      }
    });

    // Combine and process fixtures
    const allFixtures: any[] = [];
    
    teamCampaigns.forEach(teamCampaign => {
      // Add home fixtures
      (teamCampaign as any).campaign.homeFixtures.forEach(fixture => {
        allFixtures.push({
          ...fixture,
          isHome: true,
          opponent: fixture.awayCampaign?.teamCampaign?.team || null
        });
      });

      // Add away fixtures
      (teamCampaign as any).campaign.awayFixtures.forEach(fixture => {
        allFixtures.push({
          ...fixture,
          isHome: false,
          opponent: fixture.homeCampaign?.teamCampaign?.team || null
        });
      });
    });

    // Sort by scheduled date and process
    const upcomingFixtures = allFixtures
      .sort((a, b) => {
        // Handle cases where scheduledDate might be null
        const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(Date.now() + 999999999);
        const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(Date.now() + 999999999);
        return dateA.valueOf() - dateB.valueOf();
      })
      .slice(0, 10)
      .map(fixture => {
        const now = new Date();
        const scheduledDate = fixture.scheduledDate ? new Date(fixture.scheduledDate) : null;
        
        let timeUntil: string | null = null;
        if (scheduledDate) {
          const diff = scheduledDate.valueOf() - now.valueOf();
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
              timeUntil = `${days} day${days !== 1 ? 's' : ''}`;
            } else if (hours > 0) {
              timeUntil = `${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
              timeUntil = 'Less than 1 hour';
            }
          } else {
            timeUntil = 'Overdue';
          }
        }

        return {
          id: fixture.id,
          competition: fixture.competition,
          season: fixture.season,
          opponent: fixture.opponent,
          isHome: fixture.isHome,
          scheduledDate: fixture.scheduledDate,
          status: fixture.status,
          isLive: fixture.isLive,
          venue: fixture.venue,
          notes: fixture.notes,
          timeUntil,
          totalFrames: fixture.totalFrames
        };
      });

    // Separate into different categories
    const nextFixture = upcomingFixtures.length > 0 ? upcomingFixtures[0] : null;
    const thisWeek = upcomingFixtures.filter(fixture => {
      if (!fixture.scheduledDate) return false;
      const fixtureDate = new Date(fixture.scheduledDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return fixtureDate >= now && fixtureDate <= weekFromNow;
    });

    const response = {
      nextFixture,
      thisWeek,
      allUpcoming: upcomingFixtures,
      summary: {
        totalUpcoming: upcomingFixtures.length,
        thisWeekCount: thisWeek.length,
        liveFixtures: upcomingFixtures.filter(f => f.isLive).length,
        homeFixtures: upcomingFixtures.filter(f => f.isHome).length,
        awayFixtures: upcomingFixtures.filter(f => !f.isHome).length
      }
    };

    await prisma.$disconnect();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch upcoming fixtures',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
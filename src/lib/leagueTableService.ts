import prisma from "@/providers/prisma";

interface TeamStats {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  framesFor: number;
  framesAgainst: number;
  frameDifference: number;
  points: number;
}

interface LeagueTableEntry extends TeamStats {
  position: number;
  teamName: string;
}

/**
 * Calculate league table for a specific competition and season
 */
export async function calculateLeagueTable(competitionId: string, seasonId: string): Promise<LeagueTableEntry[]> {
  // Get all campaigns for this competition/season with team info
  const campaigns = await prisma.campaign.findMany({
    where: {
      competitionId,
      seasonId
    },
    include: {
      teamCampaign: {
        include: {
          team: true
        }
      },
      homeFixtures: {
        where: { isCompleted: true },
        include: {
          awayCampaign: {
            include: {
              teamCampaign: {
                include: { team: true }
              }
            }
          }
        }
      },
      awayFixtures: {
        where: { isCompleted: true },
        include: {
          homeCampaign: {
            include: {
              teamCampaign: {
                include: { team: true }
              }
            }
          }
        }
      }
    }
  });

  // Initialize team stats
  const teamStatsMap = new Map<string, TeamStats>();

  // Process each campaign
  campaigns.forEach(campaign => {
    if (!campaign.teamCampaign?.team) return; // Skip league campaigns

    const teamId = campaign.teamCampaign.team.id;
    
    if (!teamStatsMap.has(teamId)) {
      teamStatsMap.set(teamId, {
        teamId,
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        framesFor: 0,
        framesAgainst: 0,
        frameDifference: 0,
        points: 0
      });
    }

    const stats = teamStatsMap.get(teamId)!;

    // Process home fixtures
    campaign.homeFixtures.forEach(fixture => {
      stats.played++;
      stats.framesFor += fixture.homeScore;
      stats.framesAgainst += fixture.awayScore;

      if (fixture.homeScore > fixture.awayScore) {
        stats.won++;
        stats.points += 2; // 2 points for a win
      } else if (fixture.homeScore < fixture.awayScore) {
        stats.lost++;
      } else {
        stats.drawn++;
        stats.points += 1; // 1 point for a draw
      }
    });

    // Process away fixtures
    campaign.awayFixtures.forEach(fixture => {
      stats.played++;
      stats.framesFor += fixture.awayScore;
      stats.framesAgainst += fixture.homeScore;

      if (fixture.awayScore > fixture.homeScore) {
        stats.won++;
        stats.points += 2; // 2 points for a win
      } else if (fixture.awayScore < fixture.homeScore) {
        stats.lost++;
      } else {
        stats.drawn++;
        stats.points += 1; // 1 point for a draw
      }
    });

    stats.frameDifference = stats.framesFor - stats.framesAgainst;
  });

  // Convert to array and add team names
  const leagueTable: LeagueTableEntry[] = [];
  
  for (const campaign of campaigns) {
    if (!campaign.teamCampaign?.team) continue;
    
    const teamId = campaign.teamCampaign.team.id;
    const stats = teamStatsMap.get(teamId);
    
    if (stats) {
      leagueTable.push({
        ...stats,
        position: 0, // Will be set after sorting
        teamName: campaign.teamCampaign.team.name
      });
    }
  }

  // Sort by points (desc), then frame difference (desc), then frames for (desc)
  leagueTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.frameDifference !== a.frameDifference) return b.frameDifference - a.frameDifference;
    return b.framesFor - a.framesFor;
  });

  // Assign positions
  leagueTable.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return leagueTable;
}

/**
 * Save league table snapshot to database
 */
export async function saveLeagueTableSnapshot(competitionId: string, seasonId: string, leagueTable: LeagueTableEntry[]): Promise<void> {
  const snapshotDate = new Date();
  
  // Create snapshot entries
  const snapshots = leagueTable.map(entry => ({
    competitionId,
    seasonId,
    teamId: entry.teamId,
    position: entry.position,
    points: entry.points,
    played: entry.played,
    won: entry.won,
    lost: entry.lost,
    drawn: entry.drawn,
    framesFor: entry.framesFor,
    framesAgainst: entry.framesAgainst,
    frameDifference: entry.frameDifference,
    snapshotDate
  }));

  // Delete any existing snapshots for the same date to avoid duplicates
  await prisma.leagueTableSnapshot.deleteMany({
    where: {
      competitionId,
      seasonId,
      snapshotDate: {
        gte: new Date(snapshotDate.toDateString()), // Start of day
        lt: new Date(snapshotDate.getTime() + 24 * 60 * 60 * 1000) // End of day
      }
    }
  });

  // Create new snapshots
  await prisma.leagueTableSnapshot.createMany({
    data: snapshots
  });
}

/**
 * Update league tables for all active competitions/seasons
 */
export async function updateAllLeagueTables(): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    // Get all unique competition/season combinations that have completed fixtures
    const activeCombinations = await prisma.fixture.findMany({
      where: {
        isCompleted: true
      },
      select: {
        competitionId: true,
        seasonId: true
      },
      distinct: ['competitionId', 'seasonId']
    });

    console.log(`Found ${activeCombinations.length} active competition/season combinations`);

    for (const { competitionId, seasonId } of activeCombinations) {
      try {
        console.log(`Calculating league table for competition ${competitionId}, season ${seasonId}`);
        
        const leagueTable = await calculateLeagueTable(competitionId, seasonId);
        
        if (leagueTable.length > 0) {
          await saveLeagueTableSnapshot(competitionId, seasonId, leagueTable);
          updated++;
          console.log(`✓ Updated league table for competition ${competitionId}, season ${seasonId} (${leagueTable.length} teams)`);
        } else {
          console.log(`⚠ No teams found for competition ${competitionId}, season ${seasonId}`);
        }
      } catch (error) {
        console.error(`✗ Error updating league table for competition ${competitionId}, season ${seasonId}:`, error);
        errors++;
      }
    }
  } catch (error) {
    console.error('Error in updateAllLeagueTables:', error);
    errors++;
  }

  return { updated, errors };
}

/**
 * Get league position history for a team
 */
export async function getTeamLeagueHistory(teamId: string): Promise<{
  competitionId: string;
  seasonId: string;
  competition: { name: string; sortOrder: number; collection: string };
  season: { name: string; startDate?: Date; endDate?: Date };
  snapshots: Array<{
    position: number;
    points: number;
    snapshotDate: Date;
  }>;
}[]> {
  const snapshots = await prisma.leagueTableSnapshot.findMany({
    where: { teamId },
    include: {
      competition: true,
      season: true
    },
    orderBy: [
      { snapshotDate: 'asc' }
    ]
  });

  // Group by competition and season
  const grouped = snapshots.reduce((acc, snapshot) => {
    const key = `${snapshot.competitionId}-${snapshot.seasonId}`;
    
    if (!acc[key]) {
      acc[key] = {
        competitionId: snapshot.competitionId,
        seasonId: snapshot.seasonId,
        competition: snapshot.competition,
        season: snapshot.season,
        snapshots: []
      };
    }
    
    acc[key].snapshots.push({
      position: snapshot.position,
      points: snapshot.points,
      snapshotDate: snapshot.snapshotDate
    });
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
}
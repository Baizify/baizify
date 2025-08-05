import { NextRequest, NextResponse } from "next/server";
import { getTeamLeagueHistory } from "@/lib/leagueTableService";
import prisma from "@/providers/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teamId = (await params).id;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get league history
    const history = await getTeamLeagueHistory(teamId);

    // Get competitions in this team's collection for hierarchy context
    const collections = [...new Set(history.map(h => h.competition.collection))];
    const competitionHierarchy = await prisma.competition.findMany({
      where: {
        collection: {
          in: collections
        }
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        collection: true
      },
      orderBy: [
        { collection: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    // Process data for chart visualization
    const chartData = history.map(seasonHistory => {
      const competition = seasonHistory.competition;
      
      // Find adjacent competitions for context lines
      const sameCollection = competitionHierarchy.filter(c => c.collection === competition.collection);
      const currentIndex = sameCollection.findIndex(c => c.id === (competition as any).id);
      
      const divisionAbove = currentIndex > 0 ? sameCollection[currentIndex - 1] : null;
      const divisionBelow = currentIndex < sameCollection.length - 1 ? sameCollection[currentIndex + 1] : null;

      return {
        competitionId: seasonHistory.competitionId,
        seasonId: seasonHistory.seasonId,
        competition: {
          name: competition.name,
          sortOrder: competition.sortOrder,
          collection: competition.collection
        },
        season: seasonHistory.season,
        snapshots: seasonHistory.snapshots,
        hierarchy: {
          divisionAbove: divisionAbove ? {
            name: divisionAbove.name,
            sortOrder: divisionAbove.sortOrder
          } : null,
          divisionBelow: divisionBelow ? {
            name: divisionBelow.name,
            sortOrder: divisionBelow.sortOrder
          } : null
        }
      };
    });

    // Sort by season start date if available, otherwise by creation date
    chartData.sort((a, b) => {
      const dateA = a.season.startDate || new Date(a.snapshots[0]?.snapshotDate || 0);
      const dateB = b.season.startDate || new Date(b.snapshots[0]?.snapshotDate || 0);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate summary statistics
    const summary = {
      totalSeasons: history.length,
      collectionsPlayed: collections.length,
      highestDivision: Math.min(...history.map(h => h.competition.sortOrder)),
      lowestDivision: Math.max(...history.map(h => h.competition.sortOrder)),
      bestPosition: Math.min(...history.flatMap(h => h.snapshots.map(s => s.position))),
      promotions: 0, // Will be calculated below
      relegations: 0 // Will be calculated below
    };

    // Calculate promotions/relegations
    for (let i = 1; i < chartData.length; i++) {
      const prevSeason = chartData[i - 1];
      const currentSeason = chartData[i];
      
      if (prevSeason.competition.sortOrder > currentSeason.competition.sortOrder) {
        summary.promotions++;
      } else if (prevSeason.competition.sortOrder < currentSeason.competition.sortOrder) {
        summary.relegations++;
      }
    }

    const response = {
      teamId,
      teamName: team.name,
      history: chartData,
      competitionHierarchy: competitionHierarchy.reduce((acc, comp) => {
        if (!acc[comp.collection]) acc[comp.collection] = [];
        acc[comp.collection].push(comp);
        return acc;
      }, {} as Record<string, typeof competitionHierarchy>),
      summary
    };

    await prisma.$disconnect();
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching team league history:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Failed to fetch team league history',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
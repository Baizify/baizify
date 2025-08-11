import prisma from "@/providers/prisma";

/**
 * FIXTURE SCORING SYSTEM
 * ======================
 * 
 * Frame-Based Scoring:
 * - Each frame won = 2 points for the winning team
 * - Aggregate winner = 1 additional point (team with highest sum of all frame scores)
 * 
 * Example for a 4-frame fixture:
 * Frame 1: Team A wins (Frame score: 50-30) → Team A gets 2 points
 * Frame 2: Team B wins (Frame score: 40-45) → Team B gets 2 points  
 * Frame 3: Team A wins (Frame score: 35-20) → Team A gets 2 points
 * Frame 4: Team B wins (Frame score: 25-55) → Team B gets 2 points
 * 
 * Frames won: Team A = 2, Team B = 2 (tied)
 * Aggregate scores: Team A = 150, Team B = 150 (tied)
 * Final fixture points: Team A = 4, Team B = 4 (no aggregate bonus)
 * 
 * If Team A had aggregate 155 vs Team B 145:
 * Final fixture points: Team A = 5 (4 + 1 bonus), Team B = 4
 * 
 * Campaign Statistics:
 * - points: Total fixture points accumulated across all fixtures
 * - pointsScoredFor: Sum of all individual frame scores FOR this team
 * - pointsScoredAgainst: Sum of all individual frame scores AGAINST this team
 * - played: Number of completed fixtures
 * - framesPlayed: Total number of frames played across all fixtures
 */

interface FixtureResult {
  homeFramesWon: number;
  awayFramesWon: number;
  totalFramesPlayed: number;
  isCompleted: boolean;
  winningCampaignId: string | null;
  homeScore: number;
  awayScore: number;
  homeFixturePoints: number;  // Points earned by home team for this fixture
  awayFixturePoints: number;  // Points earned by away team for this fixture
  homeAggregateScore: number; // Sum of all frame scores for home team
  awayAggregateScore: number; // Sum of all frame scores for away team
}

interface CampaignUpdate {
  played?: number;
  points?: number;
  pointsScoredFor?: number;
  pointsScoredAgainst?: number;
  framesPlayed?: number;
}

/**
 * Calculate fixture result based on current frames with new scoring system:
 * - Each frame win = 2 points for the team
 * - Aggregate winner = 1 additional point (based on sum of all frame scores)
 */
export async function calculateFixtureResult(fixtureId: string): Promise<FixtureResult> {
  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
      frames: {
        where: { status: "completed" },
        orderBy: { frameNumber: "asc" }
      }
    }
  });

  if (!fixture) {
    throw new Error("Fixture not found");
  }

  const completedFrames = fixture.frames;
  const totalFrames = fixture.totalFrames || 4; // Default to 4 if not set

  let homeFramesWon = 0;
  let awayFramesWon = 0;
  let homeAggregateScore = 0;
  let awayAggregateScore = 0;

  // Count frames won and calculate aggregate scores
  for (const frame of completedFrames) {
    // Add frame scores to aggregate totals
    homeAggregateScore += frame.homeScore;
    awayAggregateScore += frame.awayScore;

    // Count frame wins based on winners
    if (frame.winnerId) {
      const winner = await prisma.campaignPlayer.findUnique({
        where: { id: frame.winnerId },
        select: { campaignId: true }
      });

      if (winner?.campaignId === fixture.homeCampaignId) {
        homeFramesWon++;
      } else if (winner?.campaignId === fixture.awayCampaignId) {
        awayFramesWon++;
      }
    }
  }

  // Calculate fixture points using new scoring system
  // 2 points per frame won
  let homeFixturePoints = homeFramesWon * 2;
  let awayFixturePoints = awayFramesWon * 2;

  // Determine if fixture is completed
  const isCompleted = completedFrames.length >= totalFrames;

  // Add 1 point for aggregate winner (only if fixture is completed)
  let winningCampaignId: string | null = null;
  if (isCompleted) {
    if (homeAggregateScore > awayAggregateScore) {
      homeFixturePoints += 1; // Home team wins aggregate
      winningCampaignId = fixture.homeCampaignId;
    } else if (awayAggregateScore > homeAggregateScore) {
      awayFixturePoints += 1; // Away team wins aggregate
      winningCampaignId = fixture.awayCampaignId;
    }
    // No additional point if aggregate is tied
  }

  return {
    homeFramesWon,
    awayFramesWon,
    totalFramesPlayed: completedFrames.length,
    isCompleted,
    winningCampaignId,
    homeScore: homeFixturePoints,     // Now represents fixture points, not just frames won
    awayScore: awayFixturePoints,     // Now represents fixture points, not just frames won
    homeFixturePoints,
    awayFixturePoints,
    homeAggregateScore,
    awayAggregateScore
  };
}

/**
 * Update campaign league statistics based on fixture result with new scoring system
 */
export async function updateCampaignStats(
  campaignId: string, 
  fixtureResult: FixtureResult,
  isHome: boolean,
  wasCompleted: boolean
): Promise<void> {
  // Only update if fixture just completed (not already processed)
  if (!fixtureResult.isCompleted || wasCompleted) {
    return;
  }

  // Calculate fixture points earned by this campaign
  const fixturePointsEarned = isHome ? fixtureResult.homeFixturePoints : fixtureResult.awayFixturePoints;
  const fixturePointsAgainst = isHome ? fixtureResult.awayFixturePoints : fixtureResult.homeFixturePoints;
  
  // Calculate aggregate score for this campaign
  const aggregateScoreFor = isHome ? fixtureResult.homeAggregateScore : fixtureResult.awayAggregateScore;
  const aggregateScoreAgainst = isHome ? fixtureResult.awayAggregateScore : fixtureResult.homeAggregateScore;

  // Get current stats
  const currentStats = await prisma.leagueCampaign.findUnique({
    where: { campaignId }
  });

  if (!currentStats) {
    // Create league campaign stats if they don't exist
    await prisma.leagueCampaign.create({
      data: {
        campaignId,
        played: 1,
        points: fixturePointsEarned,              // Total fixture points earned
        pointsScoredFor: aggregateScoreFor,       // Sum of all frame scores for this team
        pointsScoredAgainst: aggregateScoreAgainst, // Sum of all frame scores against this team
        framesPlayed: fixtureResult.totalFramesPlayed
      }
    });
  } else {
    // Update existing stats
    await prisma.leagueCampaign.update({
      where: { campaignId },
      data: {
        played: currentStats.played + 1,
        points: currentStats.points + fixturePointsEarned,
        pointsScoredFor: currentStats.pointsScoredFor + aggregateScoreFor,
        pointsScoredAgainst: currentStats.pointsScoredAgainst + aggregateScoreAgainst,
        framesPlayed: currentStats.framesPlayed + fixtureResult.totalFramesPlayed
      }
    });
  }
}

/**
 * Update fixture scores in real-time after each frame completion
 */
export async function updateFixtureScores(fixtureId: string): Promise<void> {
  try {
    const fixtureResult = await calculateFixtureResult(fixtureId);
    
    // Always update current scores, regardless of completion status
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeScore: fixtureResult.homeFixturePoints,
        awayScore: fixtureResult.awayFixturePoints,
        // Set live status if fixture has started but isn't completed
        isLive: fixtureResult.totalFramesPlayed > 0 && !fixtureResult.isCompleted,
        // Update status based on progress
        status: fixtureResult.isCompleted 
          ? "completed" 
          : fixtureResult.totalFramesPlayed > 0 
            ? "in_progress" 
            : "scheduled"
      }
    });
  } catch (error) {
    console.error("Error updating fixture scores:", error);
    throw error;
  }
}

/**
 * Process fixture completion and update all related campaign stats
 */
export async function processFixtureCompletion(fixtureId: string): Promise<void> {
  try {
    // Get current fixture state
    const currentFixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { 
        isCompleted: true, 
        homeCampaignId: true, 
        awayCampaignId: true 
      }
    });

    if (!currentFixture) {
      throw new Error("Fixture not found");
    }

    const wasCompleted = currentFixture.isCompleted;
    const fixtureResult = await calculateFixtureResult(fixtureId);

    // Always update scores first
    await updateFixtureScores(fixtureId);

    // Update campaign stats only if fixture is newly completed
    if (fixtureResult.isCompleted && !wasCompleted) {
      await prisma.fixture.update({
        where: { id: fixtureId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          isLive: false, // No longer live when completed
          status: "completed"
        }
      });

      // Update both campaign stats
      await updateCampaignStats(
        currentFixture.homeCampaignId, 
        fixtureResult, 
        true, 
        wasCompleted
      );
      
      await updateCampaignStats(
        currentFixture.awayCampaignId, 
        fixtureResult, 
        false, 
        wasCompleted
      );
    }
  } catch (error) {
    console.error("Error processing fixture completion:", error);
    throw error;
  }
}
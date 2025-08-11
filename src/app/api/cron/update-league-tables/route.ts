import { NextRequest, NextResponse } from "next/server";
import { updateAllLeagueTables } from "@/lib/leagueTableService";

export async function POST(request: NextRequest) {
  try {
    // Basic security: Check for authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting league table update job...');
    const startTime = Date.now();
    
    const result = await updateAllLeagueTables();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`League table update completed in ${duration}ms`);
    console.log(`Results: ${result.updated} updated, ${result.errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'League tables updated successfully',
      updated: result.updated,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in league table update cron job:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update league tables',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also support GET for testing/manual triggering
export async function GET(request: NextRequest) {
  return POST(request);
}
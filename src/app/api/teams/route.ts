import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
     try {
          const teams = await prisma.team.findMany({
               orderBy: {
                    name: 'asc'
               }
          });
          
          await prisma.$disconnect();
          return NextResponse.json(teams);
     } catch (error) {
          console.error('Error fetching teams:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
     }
}

export async function POST(
  request: NextRequest,
) {
     try {
          const team: { name: string } = await request.json();

          const result = await prisma.team.create({
               data: team
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error creating team:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
     }
}
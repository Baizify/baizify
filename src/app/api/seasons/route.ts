import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
     try {
          const seasons = await prisma.season.findMany({
               orderBy: {
                    createdAt: 'desc'
               }
          });
          
          await prisma.$disconnect();
          return NextResponse.json(seasons);
     } catch (error) {
          console.error('Error fetching seasons:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
     }
}

export async function POST(
  request: NextRequest,
) {
     try {
          const season: { name: string } = await request.json();

          const result = await prisma.season.create({
               data: season
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error creating season:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
     }
}
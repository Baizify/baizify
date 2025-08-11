import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
     try {
          const data: { name: string } = await request.json();

          const result = await prisma.competition.update({
               where: { id: params.id },
               data
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error updating competition:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
     }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
     try {
          await prisma.competition.delete({
               where: { id: params.id }
          });

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error deleting competition:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to delete competition' }, { status: 500 });
     }
}
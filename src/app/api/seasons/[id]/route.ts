import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
     try {
          const data: { name: string } = await request.json();

          const result = await prisma.season.update({
               where: { id: params.id },
               data
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error updating season:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to update season' }, { status: 500 });
     }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
     try {
          await prisma.season.delete({
               where: { id: params.id }
          });

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error deleting season:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 });
     }
}
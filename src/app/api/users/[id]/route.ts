import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
     try {
          const session = await auth();
          
          if (!session?.user?.id) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const userId = (await params).id;

          // Users can only update their own profile unless they're admin
          if (session.user.id !== userId && !session.user.isAdmin) {
               return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          const { name, isAdmin }: { name: string; isAdmin?: boolean } = await request.json();

          if (!name) {
               return NextResponse.json({ error: 'Name is required' }, { status: 400 });
          }

          // Prepare update data
          const updateData: any = { name };

          // Only admins can change admin status of other users
          if (isAdmin !== undefined && session.user.isAdmin && session.user.id !== userId) {
               updateData.isAdmin = isAdmin;
          }

          const updatedUser = await prisma.user.update({
               where: { id: userId },
               data: updateData,
               select: {
                    id: true,
                    name: true,
                    email: true,
                    updatedAt: true
               }
          });

          await prisma.$disconnect();
          return NextResponse.json(updatedUser);
     } catch (error) {
          console.error('Error updating user:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
     }
}

export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
) {
     try {
          const session = await auth();
          
          if (!session?.user?.id) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const userId = params.id;

          // Users can only view their own profile unless they're admin
          if (session.user.id !== userId && !session.user.isAdmin) {
               return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          const user = await prisma.user.findUnique({
               where: { id: userId },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true,
                    emailVerified: true,
                    _count: {
                         select: {
                              campaigns: true
                         }
                    }
               }
          });

          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          await prisma.$disconnect();
          return NextResponse.json(user);
     } catch (error) {
          console.error('Error fetching user:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
     }
}
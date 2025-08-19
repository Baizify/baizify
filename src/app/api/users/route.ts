import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
     const { searchParams } = new URL(request.url);
     const search = searchParams.get('search');
     const admin = searchParams.get('admin'); // Flag for admin operations

     try {
          // If admin flag is set, check for admin permissions
          if (admin === 'true') {
               const session = await auth();
               
               if (!session?.user?.id) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
               }

               const user = await prisma.user.findUnique({
                    where: { id: session.user.id }
               });

               if (!user?.isAdmin) {
                    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
               }

               // Admin view - return more detailed information
               const users = await prisma.user.findMany({
                    where: search ? {
                         OR: [
                              {
                                   name: {
                                        contains: search,
                                        mode: 'insensitive'
                                   }
                              },
                              {
                                   email: {
                                        contains: search,
                                        mode: 'insensitive'
                                   }
                              }
                         ]
                    } : undefined,
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
                    },
                    orderBy: {
                         name: 'asc'
                    }
               });
               
               await prisma.$disconnect();
               return NextResponse.json(users);
          }

          // Regular user search (existing functionality)
          const users = await prisma.user.findMany({
               where: search ? {
                    OR: [
                         {
                              name: {
                                   contains: search,
                                   mode: 'insensitive'
                              }
                         },
                         {
                              email: {
                                   contains: search,
                                   mode: 'insensitive'
                              }
                         }
                    ]
               } : undefined,
               select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
               },
               orderBy: {
                    name: 'asc'
               },
               take: 50
          });
          
          await prisma.$disconnect();
          return NextResponse.json(users);
     } catch (error) {
          console.error('Error fetching users:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
     }
}

export async function POST(request: NextRequest) {
     try {
          const session = await auth();
          
          if (!session?.user?.id) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const user = await prisma.user.findUnique({
               where: { id: session.user.id }
          });

          if (!user?.isAdmin) {
               return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
          }

          const { name, email, isAdmin = false }: { 
               name: string; 
               email: string; 
               isAdmin?: boolean; 
          } = await request.json();

          if (!name || !email) {
               return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
          }

          // Check if user with this email already exists
          const existingUser = await prisma.user.findUnique({
               where: { email }
          });

          if (existingUser) {
               return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
          }

          const newUser = await prisma.user.create({
               data: {
                    name,
                    email,
                    isAdmin,
                    // Admin-created users don't have emailVerified initially
                    // They will verify when they first log in
               }
          });

          await prisma.$disconnect();
          return NextResponse.json(newUser);
     } catch (error) {
          console.error('Error creating user:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
     }
}
import prisma from "@/providers/prisma";
import FixtureContainer from "./components/fixtureContainer";
import { Session } from "next-auth";
import { auth } from "@/auth";
import { User } from '@/generator/prisma';

const FixturePage = async ({
     params
}: {
     params: Promise<{
          id: string
     }>
}) => {
     const session: Session | null = await auth();
     let profile: User | undefined | null;
     
     const fixture = await prisma.fixture.findFirst({
          where: { 
               id: (await params).id 
          },
          include: {
               competition: true,
               season: true,
               homeCampaign: {
                    include: {
                         teamCampaign: {
                              include: {
                                   team: true
                              }
                         },
                         players: {
                              include: {
                                   user: {
                                        select: {
                                             id: true,
                                             name: true,
                                             email: true,
                                             image: true
                                        }
                                   },
                                   handicaps: {
                                        orderBy: {
                                             createdAt: 'desc'
                                        },
                                        take: 1
                                   }
                              }
                         }
                    }
               },
               awayCampaign: {
                    include: {
                         teamCampaign: {
                              include: {
                                   team: true
                              }
                         },
                         players: {
                              include: {
                                   user: {
                                        select: {
                                             id: true,
                                             name: true,
                                             email: true,
                                             image: true
                                        }
                                   },
                                   handicaps: {
                                        orderBy: {
                                             createdAt: 'desc'
                                        },
                                        take: 1
                                   }
                              }
                         }
                    }
               },
               frames: {
                    include: {
                         homePlayer: {
                              include: {
                                   user: {
                                        select: {
                                             id: true,
                                             name: true,
                                             email: true,
                                             image: true
                                        }
                                   },
                                   handicaps: {
                                        orderBy: {
                                             createdAt: 'desc'
                                        },
                                        take: 1
                                   }
                              }
                         },
                         awayPlayer: {
                              include: {
                                   user: {
                                        select: {
                                             id: true,
                                             name: true,
                                             email: true,
                                             image: true
                                        }
                                   },
                                   handicaps: {
                                        orderBy: {
                                             createdAt: 'desc'
                                        },
                                        take: 1
                                   }
                              }
                         },
                         winner: {
                              include: {
                                   user: {
                                        select: {
                                             id: true,
                                             name: true,
                                             email: true,
                                             image: true
                                        }
                                   },
                                   handicaps: {
                                        orderBy: {
                                             createdAt: 'desc'
                                        },
                                        take: 1
                                   }
                              }
                         },
                         homePlayerHandicap: true,
                         awayPlayerHandicap: true
                    },
                    orderBy: {
                         frameNumber: 'asc'
                    }
               }
          }
     });

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session.user.id
               }
          });
     }
     
     await prisma.$disconnect();

     if (!fixture) {
          return (
               <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Fixture Not Found</h1>
                    <p className="text-gray-600">The fixture youre looking for doesnt exist.</p>
               </div>
          );
     }

     return <FixtureContainer fixture={fixture as any} isUserAdmin={profile ? profile.isAdmin : false} />;
};

export default FixturePage;
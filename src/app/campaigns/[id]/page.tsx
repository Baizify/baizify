import prisma from "@/providers/prisma";
import CampaignContainer from "./components/campaignContainer";
import { Session } from "next-auth";
import { auth } from "@/auth";
import { User } from '@/generator/prisma';

const CampaignPage = async ({
     params
}: {
     params: Promise<{
          id: string
     }>
}) => {
     const session: Session | null = await auth();
     let profile: User | undefined | null;
     
     const campaign = await prisma.campaign.findFirst({
          where: { 
               id: (await params).id 
          },
          include: {
               competition: true,
               season: true,
               teamCampaign: {
                    include: {
                         team: true
                    }
               },
               leagueCampaign: true,
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
     });

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session.user.id
               }
          });
     }
     
     await prisma.$disconnect();

     if (!campaign) {
          return (
               <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h1>
                    <p className="text-gray-600">The campaign you're looking for doesn't exist.</p>
               </div>
          );
     }

     return <CampaignContainer campaign={campaign} isUserAdmin={profile ? profile.isAdmin : false} />;
};

export default CampaignPage;
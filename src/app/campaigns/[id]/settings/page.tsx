import { auth } from "@/auth";
import { User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import CampaignSettingsContainer from "./components/campaignSettingsContainer";

const CampaignSettingsPage = async ({
     params
}: {
     params: Promise<{
          id: string
     }>
}) => {
     const session: Session | null = await auth();
     let profile: User | null = null;

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }

     if (!profile?.isAdmin) {
          return redirect('/access-denied');
     }

     const { id } = await params;
     const campaign = await prisma.campaign.findUnique({
          where: {
               id
          },
          include: {
               competition: true,
               season: true,
               teamCampaign: {
                    include: {
                         team: true
                    }
               },
               leagueCampaign: true
          }
     });

     if (!campaign) {
          return <div>Campaign not found</div>;
     }

     await prisma.$disconnect();

     return <CampaignSettingsContainer campaign={campaign} />;
};

export default CampaignSettingsPage;
import { auth } from "@/auth";
import { Fixture, User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import FixtureSettingsContainer from "./components/fixtureSettingsContainer";

const FixtureSettingsPage = async ({
     params: {
          id
     }
}: {
     params: {
          id: string
     }
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

     const fixture = await prisma.fixture.findUnique({
          where: {
               id
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
                         }
                    }
               },
               awayCampaign: {
                    include: {
                         teamCampaign: {
                              include: {
                                   team: true
                              }
                         }
                    }
               }
          }
     });

     if (!fixture) {
          return <div>Fixture not found</div>;
     }

     await prisma.$disconnect();

     return <FixtureSettingsContainer fixture={fixture} />;
}

export default FixtureSettingsPage;
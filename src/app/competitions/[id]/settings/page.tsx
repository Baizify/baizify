import { auth } from "@/auth";
import { Competition, User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import CompetitionSettingsContainer from "./components/competitionSettingsContainer";

const CompetitionSettingsPage = async ({
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

     const competition: Competition | null = await prisma.competition.findUnique({
          where: {
               id
          },
     });

     if (!competition) {
          return <div>Competition not found</div>;
     }

     await prisma.$disconnect();

     return <CompetitionSettingsContainer competition={competition} />;
}

export default CompetitionSettingsPage;
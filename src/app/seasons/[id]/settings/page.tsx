import { auth } from "@/auth";
import { Season, User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import SeasonSettingsContainer from "./components/seasonSettingsContainer";

const SeasonSettingsPage = async ({
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

     const season: Season | null = await prisma.season.findUnique({
          where: {
               id
          },
     });

     if (!season) {
          return <div>Season not found</div>;
     }

     await prisma.$disconnect();

     return <SeasonSettingsContainer season={season} />;
}

export default SeasonSettingsPage;
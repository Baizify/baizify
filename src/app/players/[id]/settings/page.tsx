import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { redirect } from "next/navigation";
import prisma from "@/providers/prisma";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import PlayerProfileSettings from "./components/PlayerProfileSettings";
import PlayerAccountSettings from "./components/PlayerAccountSettings";

/**
 * Player settings page.
 * @returns The player settings page.
 */
const PlayerSettingsPage = async ({
     params
}: {
     params: Promise<{
          id: string
     }>
}): Promise<React.ReactElement> => {
     const { id } = await params;
     const session: Session | null = await auth();
     
     if (!session?.user?.id) {
          redirect('/auth/signin');
     }

     // Get the player being viewed
     const player: User | null = await prisma.user.findUnique({
          where: { id },
          include: {
               accounts: {
                    select: {
                         provider: true,
                         providerAccountId: true
                    }
               },
               _count: {
                    select: {
                         campaigns: true
                    }
               }
          }
     });

     if (!player) {
          redirect('/players');
     }

     // Get current user's admin status
     const currentUser: User | null = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
               id: true,
               isAdmin: true
          }
     });

     // Check authorization: users can only edit their own profile unless they're admin
     const isOwnProfile = session.user.id === player.id;
     const isAdmin = currentUser?.isAdmin || false;

     if (!isOwnProfile && !isAdmin) {
          redirect(`/players/${id}`);
     }

     await prisma.$disconnect();

     return (
          <div className="max-w-4xl mx-auto p-4">
               <div className="flex items-center gap-4 mb-8">
                    <Button 
                         as={Link} 
                         href={`/players/${id}`} 
                         variant="light"
                         startContent={<FaArrowLeft />}
                    >
                         Back to Profile
                    </Button>
               </div>

               <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                         {isOwnProfile ? 'Profile Settings' : `Manage ${player.name || 'Player'}`}
                    </h1>
                    <p className="text-gray-600">
                         {isOwnProfile 
                              ? 'Manage your profile and account preferences'
                              : 'Manage this player\'s profile and account settings'
                         }
                    </p>
               </div>

               <div className="space-y-8">
                    <PlayerProfileSettings 
                         player={player} 
                         isOwnProfile={isOwnProfile}
                         isAdmin={isAdmin}
                    />
                    <PlayerAccountSettings 
                         player={player} 
                         isOwnProfile={isOwnProfile}
                         isAdmin={isAdmin}
                    />
               </div>
          </div>
     )
}

export default PlayerSettingsPage;
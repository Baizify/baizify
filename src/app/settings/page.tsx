import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { redirect } from "next/navigation";
import prisma from "@/providers/prisma";
import ProfileSettings from "./components/ProfileSettings";
import AccountSettings from "./components/AccountSettings";

/**
 * User account settings page.
 * @returns The user account settings page.
 */
const SettingsPage = async (): Promise<React.ReactElement> => {
     const session: Session | null = await auth();
     
     if (!session?.user?.id) {
          redirect('/auth/signin');
     }

     const profile: User & {
          accounts: any;
          _count: any
     } | null = await prisma.user.findUnique({
          where: {
               id: session?.user?.id
          },
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

     if (!profile) {
          redirect('/auth/signin');
     }

     await prisma.$disconnect();

     return (
          <div className="max-w-4xl mx-auto p-4">
               <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                    <p className="text-gray-600">Manage your profile and account preferences</p>
               </div>

               <div className="space-y-8">
                    <ProfileSettings user={profile} />
                    <AccountSettings user={profile} />
               </div>
          </div>
     )
}

export default SettingsPage;
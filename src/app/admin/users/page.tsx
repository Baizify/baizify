import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { redirect } from "next/navigation";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import UsersList from "./components/UsersList";
import prisma from "@/providers/prisma";

/**
 * Admin users management page.
 * @returns The admin users management page.
 */
const AdminUsersPage = async (): Promise<React.ReactElement> => {
     const session: Session | null = await auth();
     
     if (!session?.user?.id) {
          redirect('/auth/signin');
     }

     const profile: User | null = await prisma.user.findUnique({
          where: {
               id: session?.user?.id
          }
     });

     if (!profile?.isAdmin) {
          redirect('/');
     }

     await prisma.$disconnect();

     return (
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                         <p className="text-gray-600">Manage all users in the system</p>
                    </div>

                    <Button 
                         as={Link} 
                         href="/admin/users/create" 
                         color="primary"
                         variant="solid"
                         startContent={<FaPlus size={16} />}
                         className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                    >
                         Create User
                    </Button>
               </div>

               <UsersList />
          </div>
     )
}

export default AdminUsersPage;
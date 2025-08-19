import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { redirect } from "next/navigation";
import CreateUserForm from "./components/CreateUserForm";
import prisma from "@/providers/prisma";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

/**
 * Create user page for admins.
 * @returns The create user page.
 */
const CreateUserPage = async (): Promise<React.ReactElement> => {
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
          <div className="max-w-2xl mx-auto p-4">
               <div className="flex items-center gap-4 mb-8">
                    <Button 
                         as={Link} 
                         href="/admin/users" 
                         variant="light"
                         startContent={<FaArrowLeft />}
                    >
                         Back to Users
                    </Button>
               </div>

               <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User</h1>
                    <p className="text-gray-600">Add a new user to the system. They can log in later using their email.</p>
               </div>

               <CreateUserForm />
          </div>
     )
}

export default CreateUserPage;
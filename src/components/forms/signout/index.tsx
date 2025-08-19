'use client'

import { Button, CircularProgress, Avatar } from "@heroui/react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SignOutFormProps {
     user: {
          name?: string | null;
          email?: string | null;
          image?: string | null;
     };
}

/**
 * Sign out form component.
 * @param user - The user object from the session
 * @returns The sign out form.
 */
const SignOutForm = ({ user }: SignOutFormProps) => {
     const [loading, setLoading] = useState<boolean>(false);
     const router = useRouter();

     const handleSignOut = () => {
          setLoading(true);

          try {
               signOut({ callbackUrl: '/' });
          } catch (err) {
               console.error(err);
          } finally {
               setLoading(false);
          }
     }

     const handleCancel = () => {
          router.back();
     }

     return (
          <div className="space-y-6">
               {/* User Info */}
               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar 
                         src={user.image || undefined}
                         name={user.name || user.email || ''}
                         size="md"
                         className="ring-2 ring-blue-500/20"
                    />
                    <div>
                         <div className="font-semibold text-gray-900">
                              {user.name || 'Player'}
                         </div>
                         <div className="text-sm text-gray-600">
                              {user.email}
                         </div>
                    </div>
               </div>

               {/* Sign out message */}
               <div className="text-center text-gray-600">
                    <p>You will be signed out of your account and redirected to the home page.</p>
               </div>

               {/* Action buttons */}
               <div className="space-y-3">
                    {loading ? (
                         <div className="flex justify-center">
                              <CircularProgress />
                         </div>
                    ) : (
                         <>
                              <Button 
                                   color="danger" 
                                   variant="solid" 
                                   className="w-full" 
                                   onPress={handleSignOut}
                                   startContent={<FaSignOutAlt />}
                              >
                                   Sign Out
                              </Button>
                              <Button 
                                   color="default" 
                                   variant="bordered" 
                                   className="w-full" 
                                   onPress={handleCancel}
                                   startContent={<FaTimes />}
                              >
                                   Cancel
                              </Button>
                         </>
                    )}
               </div>
          </div>
     )
}

export default SignOutForm;
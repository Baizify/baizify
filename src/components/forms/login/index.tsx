'use client'

import { Button, CircularProgress } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa6";

/**
 * Method to return the login provider list component.
 * @returns The login provider list.
 */
const LoginProviderList = () => {
     const [loading,setLoading] = useState<boolean>(false)

     const loginWithProvider = (provider: string) => {
          setLoading(true)

          try {
               signIn(provider);
          } catch (err) {
               console.error(err);
          } finally {
               setLoading(false);
          }
     }

     return (
          <>
               {
                    loading ?
                         <CircularProgress />
                         : (
                              <Button color="primary" variant="ghost" className="w-full" onPress={() => loginWithProvider("google")}>
                                   <FaGoogle /> Sign in with Google
                              </Button>
                         )
               }
          </>
     )
}

export default LoginProviderList;
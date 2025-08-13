import Link from "next/link";
import { Button } from "@heroui/react";
import { FaLock, FaHome } from "react-icons/fa";

const AccessDeniedPage = () => {
     return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
               <div className="text-center max-w-md">
                    <FaLock size={64} className="text-gray-400 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-8">
                         You dont have permission to access this page. Only administrators can view this content.
                    </p>
                    <Button 
                         as={Link}
                         href="/"
                         color="primary"
                         variant="solid"
                         startContent={<FaHome />}
                    >
                         Go Home
                    </Button>
               </div>
          </div>
     );
};

export default AccessDeniedPage;
'use client'

import { useState } from 'react';
import { Button } from "@heroui/react";
import { FaPlus } from "react-icons/fa6";
import CreateTeamModal from "../CreateTeamModal";
import TeamCards from "../teamCards";

interface TeamsPageClientProps {
     teams: any[];
     isAdmin: boolean;
}

const TeamsPageClient = ({ teams, isAdmin }: TeamsPageClientProps) => {
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

     const handleTeamCreated = () => {
          // Refresh the page to show the new team
          window.location.reload();
     };

     return (
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
                         <p className="text-gray-600">Browse all teams in the league system</p>
                    </div>

                    {isAdmin && (
                         <Button 
                              onPress={() => setIsCreateModalOpen(true)}
                              color="primary"
                              variant="solid"
                              startContent={<FaPlus size={16} />}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                         >
                              Create Team
                         </Button>
                    )}
               </div>

               <TeamCards teams={teams} isAdmin={isAdmin} />

               <CreateTeamModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onTeamCreated={handleTeamCreated}
               />
          </div>
     );
};

export default TeamsPageClient;
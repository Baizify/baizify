'use client'

import { useState } from 'react';
import { Button } from "@heroui/react";
import { FaPlus } from "react-icons/fa6";
import CreateCompetitionModal from "../CreateCompetitionModal";
import CompetitionCards from "../competitionCards";

interface CompetitionsPageClientProps {
     competitions: any[];
     isAdmin: boolean;
}

const CompetitionsPageClient = ({ competitions, isAdmin }: CompetitionsPageClientProps) => {
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
     const [refreshKey, setRefreshKey] = useState(0);

     const handleCompetitionCreated = () => {
          // Trigger a refresh of the competitions list
          setRefreshKey(prev => prev + 1);
          window.location.reload();
     };

     return (
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitions</h1>
                         <p className="text-gray-600">Discover and follow your favorite leagues and tournaments</p>
                    </div>

                    {isAdmin && (
                         <Button 
                              onPress={() => setIsCreateModalOpen(true)}
                              color="primary"
                              variant="solid"
                              startContent={<FaPlus size={16} />}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                         >
                              Create Competition
                         </Button>
                    )}
               </div>

               <CompetitionCards competitions={competitions} isAdmin={isAdmin} />

               <CreateCompetitionModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCompetitionCreated={handleCompetitionCreated}
               />
          </div>
     );
};

export default CompetitionsPageClient;
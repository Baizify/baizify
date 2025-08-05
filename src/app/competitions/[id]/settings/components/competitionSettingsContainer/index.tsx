'use client'

import { Competition } from "@/generator/prisma";
import { Tabs, Tab } from "@heroui/react";
import { FaCog, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import CompetitionForm from "../competitionForm";
import SeasonsManager from "../seasonsManager";

const CompetitionSettingsContainer = ({
     competition
}: {
     competition: Competition
}) => {
     return (
          <>
               <div className="flex flex-row items-center justify-between mb-6">
                    <div>
                         <h1 className="text-xl font-bold">{competition.name}</h1>
                         {competition.updatedAt && (
                              <p className="text-sm text-gray-600">
                                   Updated: {format(competition.updatedAt, "dd/MM/yyyy")}
                              </p>
                         )}
                    </div>
               </div>

               <Tabs variant="light" className="w-full">
                    <Tab 
                         key="competition" 
                         title={
                              <div className="flex flex-row items-center">
                                   <FaCog size={18} className="mr-2" />
                                   <span>Competition</span>
                              </div>
                         }
                    >
                         <CompetitionForm competition={competition} />
                    </Tab>
                    
                    <Tab 
                         key="seasons" 
                         title={
                              <div className="flex flex-row items-center">
                                   <FaCalendarAlt size={18} className="mr-2" />
                                   <span>Seasons</span>
                              </div>
                         }
                    >
                         <SeasonsManager />
                    </Tab>
               </Tabs>
          </>
     );
};

export default CompetitionSettingsContainer;
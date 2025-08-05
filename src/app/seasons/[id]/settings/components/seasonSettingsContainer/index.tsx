'use client'

import { Season } from "@/generator/prisma";
import { Tabs, Tab } from "@heroui/react";
import { FaCog, FaTrophy } from "react-icons/fa";
import { format } from "date-fns";
import SeasonForm from "../seasonForm";
import CampaignsManager from "../campaignsManager";

const SeasonSettingsContainer = ({
     season
}: {
     season: Season
}) => {
     return (
          <>
               <div className="flex flex-row items-center justify-between mb-6">
                    <div>
                         <h1 className="text-xl font-bold">{season.name}</h1>
                         {season.updatedAt && (
                              <p className="text-sm text-gray-600">
                                   Updated: {format(season.updatedAt, "dd/MM/yyyy")}
                              </p>
                         )}
                    </div>
               </div>

               <Tabs variant="light" className="w-full">
                    <Tab 
                         key="season" 
                         title={
                              <div className="flex flex-row items-center">
                                   <FaCog size={18} className="mr-2" />
                                   <span>Season</span>
                              </div>
                         }
                    >
                         <SeasonForm season={season} />
                    </Tab>
                    
                    <Tab 
                         key="campaigns" 
                         title={
                              <div className="flex flex-row items-center">
                                   <FaTrophy size={18} className="mr-2" />
                                   <span>Campaigns</span>
                              </div>
                         }
                    >
                         <CampaignsManager seasonId={season.id} />
                    </Tab>
               </Tabs>
          </>
     );
};

export default SeasonSettingsContainer;
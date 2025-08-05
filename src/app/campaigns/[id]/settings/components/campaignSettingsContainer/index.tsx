'use client'

import { Campaign, Competition, Season, Team } from "@/generator/prisma";
import { Tabs, Tab } from "@heroui/react";
import { FaUsers } from "react-icons/fa";
import { format } from "date-fns";
import PlayersManager from "../playersManager";

interface CampaignWithRelations extends Campaign {
     competition: Competition;
     season: Season;
     teamCampaign?: {
          team: Team;
     } | null;
     leagueCampaign?: object | null;
}

const CampaignSettingsContainer = ({
     campaign
}: {
     campaign: CampaignWithRelations
}) => {
     const campaignType = campaign.teamCampaign ? 'Team' : campaign.leagueCampaign ? 'League' : 'Unknown';
     
     return (
          <>
               <div className="flex flex-row items-center justify-between mb-6">
                    <div>
                         <h1 className="text-xl font-bold">
                              {campaign.competition.name} - {campaign.season.name}
                         </h1>
                         <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              <span>Type: {campaignType}</span>
                              {campaign.teamCampaign?.team && (
                                   <span>Team: {campaign.teamCampaign.team.name}</span>
                              )}
                              {campaign.updatedAt && (
                                   <span>Updated: {format(campaign.updatedAt, "dd/MM/yyyy")}</span>
                              )}
                         </div>
                    </div>
               </div>

               <Tabs variant="light" className="w-full">
                    <Tab 
                         key="players" 
                         title={
                              <div className="flex flex-row items-center">
                                   <FaUsers size={18} className="mr-2" />
                                   <span>Players</span>
                              </div>
                         }
                    >
                         <PlayersManager campaignId={campaign.id} />
                    </Tab>
               </Tabs>
          </>
     );
};

export default CampaignSettingsContainer;
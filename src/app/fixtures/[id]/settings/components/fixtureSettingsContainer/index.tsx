'use client'

import { 
     Fixture, 
     Competition, 
     Season, 
     Team, 
     Campaign 
} from "@/generator/prisma";
import { Card, CardBody, CardHeader, Tabs, Tab } from "@heroui/react";
import { FaCog, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";
import FixtureEditForm from "../fixtureEditForm";

interface FixtureWithRelations extends Fixture {
     competition: Competition;
     season: Season;
     homeCampaign: {
          teamCampaign?: {
               team: Team;
          } | null;
     };
     awayCampaign: {
          teamCampaign?: {
               team: Team;
          } | null;
     };
}

const FixtureSettingsContainer = ({
     fixture
}: {
     fixture: FixtureWithRelations
}) => {
     return (
          <div className="max-w-4xl mx-auto p-4">
               {/* Header */}
               <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                         <Link 
                              href={`/fixtures/${fixture.id}`}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                         >
                              <FaArrowLeft size={14} />
                              Back to Fixture
                         </Link>
                    </div>
                    
                    <Card>
                         <CardBody>
                              <div className="flex items-center gap-4">
                                   <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                             <FaCog size={24} className="text-white" />
                                        </div>
                                   </div>
                                   <div className="flex-1">
                                        <h1 className="text-2xl font-bold mb-2">
                                             Fixture Settings
                                        </h1>
                                        <p className="text-gray-600 mb-2">
                                             {fixture.homeCampaign?.teamCampaign?.team?.name || 'TBD'} vs {fixture.awayCampaign?.teamCampaign?.team?.name || 'TBD'}
                                        </p>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                             <span>{fixture.competition.name} - {fixture.season.name}</span>
                                             <span>Status: {fixture.status.replace('_', ' ').toUpperCase()}</span>
                                             {fixture.scheduledDate && (
                                                  <span>
                                                       Scheduled: {format(new Date(fixture.scheduledDate), "dd/MM/yyyy HH:mm")}
                                                  </span>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         </CardBody>
                    </Card>
               </div>

               {/* Settings Tabs */}
               <Tabs variant="underlined" className="w-full">
                    <Tab 
                         key="details" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaInfoCircle size={16} />
                                   <span>Fixture Details</span>
                              </div>
                         }
                    >
                         <div className="mt-6">
                              <FixtureEditForm fixture={fixture} />
                         </div>
                    </Tab>
               </Tabs>
          </div>
     );
};

export default FixtureSettingsContainer;
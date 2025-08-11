'use client'

import { 
     Fixture, 
     Competition, 
     Season, 
     Team, 
     User,
     Campaign
} from "@/generator/prisma";
import { 
     Button, 
     Card, 
     CardBody, 
     CardHeader, 
     Chip,
     Divider
} from "@heroui/react";
import { FaCog, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlay, FaStop } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import FramesManager from "../framesManager";

interface CampaignPlayerWithUser {
     id: string;
     campaignId: string;
     userId: string;
     user: User;
     createdAt: string;
}

interface CampaignWithRelations extends Campaign {
     teamCampaign?: {
          team: Team;
     } | null;
     players: CampaignPlayerWithUser[];
}

interface FrameWithPlayers {
     id: string;
     fixtureId: string;
     frameNumber: number;
     homePlayerId?: string;
     awayPlayerId?: string;
     homeScore: number;
     awayScore: number;
     winnerId?: string;
     status: string;
     notes?: string;
     homePlayer?: CampaignPlayerWithUser;
     awayPlayer?: CampaignPlayerWithUser;
     winner?: CampaignPlayerWithUser;
     createdAt: string;
     updatedAt?: string;
}

interface FixtureWithRelations extends Fixture {
     competition: Competition;
     season: Season;
     homeCampaign: CampaignWithRelations;
     awayCampaign: CampaignWithRelations;
     frames: FrameWithPlayers[];
     isLive?: boolean;
}

const FixtureContainer = ({
     fixture,
     isUserAdmin
}: {
     fixture: FixtureWithRelations;
     isUserAdmin: boolean;
}) => {
     const [isLive, setIsLive] = useState(fixture.isLive || false);
     const [isToggling, setIsToggling] = useState(false);

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'completed': return 'success';
               case 'in_progress': return 'warning';
               case 'cancelled': return 'danger';
               default: return 'default';
          }
     };

     const handleToggleLive = async () => {
          if (fixture.isCompleted) return; // Can't toggle live on completed fixtures
          
          setIsToggling(true);
          try {
               const response = await fetch(`/api/fixtures/${fixture.id}/live`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isLive: !isLive })
               });

               if (response.ok) {
                    setIsLive(!isLive);
                    // Optionally reload the page to refresh all data
                    window.location.reload();
               }
          } catch (error) {
               console.error('Error toggling live status:', error);
          } finally {
               setIsToggling(false);
          }
     };

     return (
          <div className="max-w-6xl mx-auto p-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                         <h1 className="text-2xl font-bold mb-2">
                              {fixture.homeCampaign.teamCampaign?.team?.name || 'TBD'} vs {fixture.awayCampaign.teamCampaign?.team?.name || 'TBD'}
                         </h1>
                         <div className="flex flex-wrap gap-2 mb-2">
                              <Chip
                                   startContent={<FaTrophy size={14} />}
                                   variant="flat"
                                   color="primary"
                              >
                                   {fixture.competition.name} - {fixture.season.name}
                              </Chip>
                              <Chip 
                                   size="sm" 
                                   color={getStatusColor(fixture.status)}
                                   variant="flat"
                              >
                                   {fixture.status.replace('_', ' ').toUpperCase()}
                              </Chip>
                              {isLive && (
                                   <Chip 
                                        size="sm" 
                                        color="danger"
                                        variant="solid"
                                        className="animate-pulse"
                                   >
                                        🔴 LIVE
                                   </Chip>
                              )}
                         </div>
                         <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {fixture.scheduledDate && (
                                   <span className="flex items-center gap-1">
                                        <FaCalendarAlt size={12} />
                                        {format(new Date(fixture.scheduledDate), "dd MMMM yyyy 'at' HH:mm")}
                                   </span>
                              )}
                              {fixture.venue && (
                                   <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt size={12} />
                                        {fixture.venue}
                                   </span>
                              )}
                              <span className="flex items-center gap-1">
                                   <FaUsers size={12} />
                                   {fixture.frames.length} Frames
                              </span>
                         </div>
                    </div>
                    {isUserAdmin && (
                         <div className="flex gap-2">
                              <Button
                                   as={Link}
                                   href={`/fixtures/${fixture.id}/settings`}
                                   size="sm"
                                   color="default"
                                   variant="bordered"
                                   startContent={<FaCog size={14} />}
                              >
                                   Settings
                              </Button>
                              {!fixture.isCompleted && (
                                   <Button
                                        size="sm"
                                        color={isLive ? "danger" : "success"}
                                        variant="solid"
                                        startContent={isLive ? <FaStop size={14} /> : <FaPlay size={14} />}
                                        onPress={handleToggleLive}
                                        isLoading={isToggling}
                                        disabled={isToggling}
                                   >
                                        {isLive ? "Stop Live" : "Go Live"}
                                   </Button>
                              )}
                         </div>
                    )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="col-span-1 lg:col-span-3">
                         <CardHeader>
                              <h3 className="text-lg font-semibold">Match Score</h3>
                         </CardHeader>
                         <CardBody>
                              <div className="flex items-center justify-between">
                                   <div className="text-center flex-1">
                                        <div className="text-sm text-gray-600 mb-1">
                                             {fixture.homeCampaign.teamCampaign?.team?.name || 'Home Team'}
                                        </div>
                                        <div className="text-4xl font-bold text-primary">
                                             {fixture.homeScore}
                                        </div>
                                   </div>
                                   
                                   <div className="text-center px-8">
                                        <div className="text-2xl font-light text-gray-500">vs</div>
                                   </div>
                                   
                                   <div className="text-center flex-1">
                                        <div className="text-sm text-gray-600 mb-1">
                                             {fixture.awayCampaign.teamCampaign?.team?.name || 'Away Team'}
                                        </div>
                                        <div className="text-4xl font-bold text-secondary">
                                             {fixture.awayScore}
                                        </div>
                                   </div>
                              </div>
                         </CardBody>
                    </Card>
               </div>

               <Card>
                    <CardHeader className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold">Frames</h3>
                    </CardHeader>
                    <CardBody className="p-0">
                         <FramesManager 
                              fixture={fixture} 
                              isUserAdmin={isUserAdmin}
                         />
                    </CardBody>
               </Card>

               {fixture.notes && (
                    <Card className="mt-6">
                         <CardHeader>
                              <h3 className="text-lg font-semibold">Notes</h3>
                         </CardHeader>
                         <CardBody>
                              <p className="text-gray-700">{fixture.notes}</p>
                         </CardBody>
                    </Card>
               )}
          </div>
     );
};

export default FixtureContainer;
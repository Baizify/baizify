'use client'

import { Campaign, Competition, Season, Team, User } from "@/generator/prisma";
import { Button, Card, CardBody, CardHeader, Avatar, Chip } from "@heroui/react";
import { FaCog, FaTrophy, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";

interface CampaignPlayerWithUser {
     id: string;
     campaignId: string;
     userId: string;
     user: User;
     createdAt: string;
}

interface CampaignWithRelations extends Campaign {
     competition: Competition;
     season: Season;
     teamCampaign?: {
          team: Team;
     } | null;
     leagueCampaign?: object | null;
     players: CampaignPlayerWithUser[];
}

const CampaignContainer = ({
     campaign,
     isUserAdmin
}: {
     campaign: CampaignWithRelations;
     isUserAdmin: boolean;
}) => {
     const campaignType = campaign.teamCampaign ? 'Team Campaign' : campaign.leagueCampaign ? 'League Campaign' : 'Unknown';

     return (
          <>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                         <h1 className="text-2xl font-bold mb-2">
                              {campaign.competition.name} - {campaign.season.name}
                         </h1>
                         <div className="flex flex-wrap gap-2 mb-2">
                              <Chip
                                   startContent={<FaTrophy size={14} />}
                                   variant="flat"
                                   color="primary"
                              >
                                   {campaignType}
                              </Chip>
                              {campaign.teamCampaign?.team && (
                                   <Chip variant="flat" color="secondary">
                                        {campaign.teamCampaign.team.name}
                                   </Chip>
                              )}
                         </div>
                         <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                   <FaCalendarAlt size={12} />
                                   Created: {format(new Date(campaign.createdAt), "dd/MM/yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                   <FaUsers size={12} />
                                   {campaign.players.length} Players
                              </span>
                         </div>
                    </div>

                    {isUserAdmin && (
                         <Button
                              as={Link}
                              href={`/campaign/${campaign.id}/settings`}
                              variant="bordered"
                              startContent={<FaCog />}
                         >
                              Campaign Settings
                         </Button>
                    )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campaign Details */}
                    <Card>
                         <CardHeader>
                              <h3 className="text-lg font-semibold">Campaign Details</h3>
                         </CardHeader>
                         <CardBody>
                              <div className="space-y-3">
                                   <div>
                                        <span className="font-medium text-gray-700">Competition:</span>
                                        <p className="mt-1">{campaign.competition.name}</p>
                                   </div>
                                   <div>
                                        <span className="font-medium text-gray-700">Season:</span>
                                        <p className="mt-1">{campaign.season.name}</p>
                                   </div>
                                   <div>
                                        <span className="font-medium text-gray-700">Type:</span>
                                        <p className="mt-1">{campaignType}</p>
                                   </div>
                                   {campaign.teamCampaign?.team && (
                                        <div>
                                             <span className="font-medium text-gray-700">Team:</span>
                                             <div className="mt-1 flex items-center justify-between">
                                                  <p>{campaign.teamCampaign.team.name}</p>
                                                  <Button
                                                       as={Link}
                                                       href={`/teams/${campaign.teamCampaign.team.id}`}
                                                       size="sm"
                                                       variant="flat"
                                                       color="primary"
                                                  >
                                                       View Team
                                                  </Button>
                                             </div>
                                        </div>
                                   )}
                                   {campaign.leagueCampaign && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                                             <div>
                                                  <span className="text-sm font-medium text-gray-600">Games Played:</span>
                                                  <p className="text-lg font-semibold">{(campaign.leagueCampaign as any)?.played || 0}</p>
                                             </div>
                                             <div>
                                                  <span className="text-sm font-medium text-gray-600">Points:</span>
                                                  <p className="text-lg font-semibold">{(campaign.leagueCampaign as any)?.points || 0}</p>
                                             </div>
                                             <div>
                                                  <span className="text-sm font-medium text-gray-600">Frames Played:</span>
                                                  <p className="text-lg font-semibold">{(campaign.leagueCampaign as any)?.framesPlayed || 0}</p>
                                             </div>
                                             <div>
                                                  <span className="text-sm font-medium text-gray-600">Points Difference:</span>
                                                  <p className="text-lg font-semibold">
                                                       {((campaign.leagueCampaign as any)?.pointsScoredFor || 0) - ((campaign.leagueCampaign as any)?.pointsScoredAgainst || 0)}
                                                  </p>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </CardBody>
                    </Card>

                    {/* Players */}
                    <Card>
                         <CardHeader className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Players</h3>
                              {isUserAdmin && (
                                   <Button
                                        as={Link}
                                        href={`/campaign/${campaign.id}/settings`}
                                        size="sm"
                                        variant="light"
                                   >
                                        Manage Players
                                   </Button>
                              )}
                         </CardHeader>
                         <CardBody>
                              {campaign.players.length > 0 ? (
                                   <div className="space-y-3">
                                        {campaign.players.map((player) => (
                                             <div key={player.id} className="flex items-center gap-3">
                                                  <Avatar
                                                       src={player.user.image || undefined}
                                                       name={player.user.name || player.user.email}
                                                       size="sm"
                                                  />
                                                  <div>
                                                       <p className="font-medium">{player.user.name || player.user.email}</p>
                                                       <p className="text-sm text-gray-500">{player.user.email}</p>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              ) : (
                                   <div className="text-center py-8">
                                        <FaUsers className="mx-auto mb-3 text-gray-400" size={48} />
                                        <p className="text-gray-500">No players assigned to this campaign yet.</p>
                                        {isUserAdmin && (
                                             <Button
                                                  as={Link}
                                                  href={`/campaign/${campaign.id}/settings`}
                                                  className="mt-3"
                                                  color="primary"
                                                  variant="flat"
                                             >
                                                  Add Players
                                             </Button>
                                        )}
                                   </div>
                              )}
                         </CardBody>
                    </Card>
               </div>
          </>
     );
};

export default CampaignContainer;
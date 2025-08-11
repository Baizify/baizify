'use client'

import { Card, CardBody, CardHeader, Spinner, Chip, Progress } from "@heroui/react";
import { FaTrophy, FaUsers, FaCalendarAlt, FaChartBar } from "react-icons/fa";
import { useState, useEffect } from "react";

interface Campaign {
     id: string;
     competition: { id: string; name: string };
     season: { id: string; name: string };
     record: {
          played: number;
          won: number;
          lost: number;
          drawn: number;
          winPercentage: number;
     };
     frames: {
          for: number;
          against: number;
          difference: number;
     };
     players: Array<{ id: string; user: { name: string; email: string } }>;
     totalFixtures: number;
     upcomingFixtures: number;
     recentForm: string[];
}

const CurrentCampaigns = ({ teamId }: { teamId: string }) => {
     const [campaigns, setCampaigns] = useState<Campaign[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchCurrentCampaigns = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/campaigns/current`);
                    if (response.ok) {
                         const data = await response.json();
                         setCampaigns(data);
                    }
               } catch (error) {
                    console.error('Error fetching current campaigns:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchCurrentCampaigns();
     }, [teamId]);

     const getFormColor = (result: string) => {
          switch (result) {
               case 'W': return 'success';
               case 'L': return 'danger';
               case 'D': return 'warning';
               default: return 'default';
          }
     };

     const getWinRateColor = (percentage: number) => {
          if (percentage >= 70) return 'success';
          if (percentage >= 50) return 'warning';
          return 'danger';
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
               </div>
          );
     }

     if (campaigns.length === 0) {
          return (
               <Card>
                    <CardBody className="text-center py-8">
                         <FaTrophy size={48} className="mx-auto text-gray-400 mb-4" />
                         <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Campaigns</h3>
                         <p className="text-gray-500">This team is not currently participating in any campaigns.</p>
                    </CardBody>
               </Card>
          );
     }

     return (
          <div className="space-y-6">
               {campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                         <CardHeader>
                              <div className="flex justify-between items-start w-full">
                                   <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                             <FaTrophy className="text-yellow-500" />
                                             {campaign.competition.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{campaign.season.name}</p>
                                   </div>
                                   <div className="flex gap-2">
                                        {campaign.recentForm.map((result, index) => (
                                             <Chip 
                                                  key={index}
                                                  size="sm" 
                                                  color={getFormColor(result)}
                                                  variant="solid"
                                             >
                                                  {result}
                                             </Chip>
                                        ))}
                                   </div>
                              </div>
                         </CardHeader>
                         <CardBody>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                   {/* Record */}
                                   <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-600 flex items-center gap-1">
                                             <FaChartBar size={12} />
                                             Record
                                        </h4>
                                        <div className="space-y-1">
                                             <div className="flex justify-between text-sm">
                                                  <span>Win Rate</span>
                                                  <span className="font-semibold">{campaign.record.winPercentage}%</span>
                                             </div>
                                             <Progress 
                                                  value={campaign.record.winPercentage} 
                                                  color={getWinRateColor(campaign.record.winPercentage)}
                                                  size="sm"
                                             />
                                             <p className="text-xs text-gray-500">
                                                  {campaign.record.won}W-{campaign.record.lost}L-{campaign.record.drawn}D 
                                                  ({campaign.record.played} played)
                                             </p>
                                        </div>
                                   </div>

                                   {/* Frames */}
                                   <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-600">Frame Difference</h4>
                                        <div className="space-y-1">
                                             <div className="flex justify-between text-sm">
                                                  <span>For/Against</span>
                                                  <span className="font-semibold">
                                                       {campaign.frames.for}/{campaign.frames.against}
                                                  </span>
                                             </div>
                                             <div className={`text-lg font-bold ${
                                                  campaign.frames.difference > 0 ? 'text-green-600' : 
                                                  campaign.frames.difference < 0 ? 'text-red-600' : 'text-gray-600'
                                             }`}>
                                                  {campaign.frames.difference > 0 ? '+' : ''}{campaign.frames.difference}
                                             </div>
                                        </div>
                                   </div>

                                   {/* Fixtures */}
                                   <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-600 flex items-center gap-1">
                                             <FaCalendarAlt size={12} />
                                             Fixtures
                                        </h4>
                                        <div className="space-y-1">
                                             <div className="flex justify-between text-sm">
                                                  <span>Completed</span>
                                                  <span className="font-semibold">{campaign.record.played}</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                  <span>Upcoming</span>
                                                  <span className="font-semibold text-blue-600">{campaign.upcomingFixtures}</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                  <span>Total</span>
                                                  <span className="font-semibold">{campaign.totalFixtures}</span>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Players */}
                                   <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-600 flex items-center gap-1">
                                             <FaUsers size={12} />
                                             Squad ({campaign.players.length})
                                        </h4>
                                        <div className="space-y-1 max-h-20 overflow-y-auto">
                                             {campaign.players.slice(0, 4).map((player) => (
                                                  <p key={player.id} className="text-xs text-gray-600 truncate">
                                                       {player.user.name || player.user.email}
                                                  </p>
                                             ))}
                                             {campaign.players.length > 4 && (
                                                  <p className="text-xs text-gray-500">
                                                       +{campaign.players.length - 4} more
                                                  </p>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         </CardBody>
                    </Card>
               ))}
          </div>
     );
};

export default CurrentCampaigns;
'use client'

import { Card, CardBody, CardHeader, Spinner, Tabs, Tab, Avatar, Progress, Chip } from "@heroui/react";
import { FaCrown, FaTrophy, FaFire, FaUsers } from "react-icons/fa";
import { useState, useEffect } from "react";

interface Player {
     id: string;
     name: string;
     email: string;
     campaigns: number;
     framesPlayed: number;
     framesWon: number;
     framesLost: number;
     winPercentage: number;
     averageScore: number;
     totalScore: number;
     highestScore: number;
     seasonsActive: number;
     competitionsPlayed: number;
     recentActivity: Array<{
          date: string;
          type: string;
          score: number;
          result: string;
     }>;
}

interface PlayersData {
     allPlayers: Player[];
     topPerformers: {
          byWinPercentage: Player[];
          byFramesWon: Player[];
          byAverageScore: Player[];
          mostActive: Player[];
     };
     summary: {
          totalPlayers: number;
          activePlayers: number;
          totalFramesPlayed: number;
          totalFramesWon: number;
     };
}

const TopPlayers = ({ teamId }: { teamId: string }) => {
     const [playersData, setPlayersData] = useState<PlayersData | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchPlayers = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/players`);
                    if (response.ok) {
                         const data = await response.json();
                         setPlayersData(data);
                    }
               } catch (error) {
                    console.error('Error fetching players:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchPlayers();
     }, [teamId]);

     const getInitials = (name: string) => {
          return name
               .split(' ')
               .map(n => n[0])
               .join('')
               .toUpperCase()
               .slice(0, 2);
     };

     const formatRecentActivity = (activity: Player['recentActivity']) => {
          if (activity.length === 0) return 'No recent activity';
          
          const recent = activity[0];
          const daysAgo = Math.floor((new Date().getTime() - new Date(recent.date).getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysAgo === 0) return 'Active today';
          if (daysAgo === 1) return 'Active yesterday'; 
          if (daysAgo < 7) return `Active ${daysAgo} days ago`;
          return 'Inactive';
     };

     const PlayerCard = ({ player, rank }: { player: Player; rank: number }) => (
          <Card className="mb-4">
               <CardBody>
                    <div className="flex items-center gap-4">
                         {/* Rank */}
                         <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                   rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                   rank === 2 ? 'bg-gray-100 text-gray-800' :
                                   rank === 3 ? 'bg-orange-100 text-orange-800' :
                                   'bg-blue-100 text-blue-800'
                              }`}>
                                   {rank === 1 ? <FaCrown size={14} /> : rank}
                              </div>
                         </div>

                         {/* Avatar */}
                         <Avatar
                              name={getInitials(player.name)}
                              size="md"
                              className="flex-shrink-0"
                         />

                         {/* Player Info */}
                         <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                   <h4 className="font-semibold truncate">{player.name}</h4>
                                   {player.framesWon > 50 && (
                                        <Chip size="sm" color="warning" variant="flat">
                                             <FaTrophy size={10} className="mr-1" />
                                             Top Scorer
                                        </Chip>
                                   )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 truncate">{player.email}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                   <div>
                                        <span className="text-gray-500">Win Rate</span>
                                        <p className="font-semibold">{player.winPercentage}%</p>
                                   </div>
                                   <div>
                                        <span className="text-gray-500">Frames</span>
                                        <p className="font-semibold">{player.framesWon}/{player.framesPlayed}</p>
                                   </div>
                                   <div>
                                        <span className="text-gray-500">Avg Score</span>
                                        <p className="font-semibold">{player.averageScore}</p>
                                   </div>
                                   <div>
                                        <span className="text-gray-500">Status</span>
                                        <p className="font-semibold text-xs">{formatRecentActivity(player.recentActivity)}</p>
                                   </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mt-2">
                                   <Progress 
                                        value={player.winPercentage} 
                                        color={player.winPercentage >= 70 ? 'success' : player.winPercentage >= 50 ? 'warning' : 'danger'}
                                        size="sm"
                                   />
                              </div>
                         </div>

                         {/* Key Stats */}
                         <div className="hidden lg:block text-right">
                              <div className="text-xs text-gray-500 mb-1">Campaigns</div>
                              <div className="text-lg font-bold">{player.campaigns}</div>
                              <div className="text-xs text-gray-500 mt-1">High: {player.highestScore}</div>
                         </div>
                    </div>
               </CardBody>
          </Card>
     );

     if (loading) {
          return (
               <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
               </div>
          );
     }

     if (!playersData || playersData.allPlayers.length === 0) {
          return (
               <Card>
                    <CardBody className="text-center py-8">
                         <FaUsers size={48} className="mx-auto text-gray-400 mb-4" />
                         <h3 className="text-lg font-semibold text-gray-600 mb-2">No Player Data</h3>
                         <p className="text-gray-500">No players have participated in campaigns for this team yet.</p>
                    </CardBody>
               </Card>
          );
     }

     return (
          <div className="space-y-6">
               {/* Summary Cards */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaUsers className="text-blue-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{playersData.summary.totalPlayers}</p>
                              <p className="text-sm text-gray-600">Total Players</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaFire className="text-orange-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{playersData.summary.activePlayers}</p>
                              <p className="text-sm text-gray-600">Active Players</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaTrophy className="text-green-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{playersData.summary.totalFramesWon}</p>
                              <p className="text-sm text-gray-600">Total Wins</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaCrown className="text-yellow-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">
                                   {playersData.summary.totalFramesPlayed > 0 
                                        ? Math.round((playersData.summary.totalFramesWon / playersData.summary.totalFramesPlayed) * 100)
                                        : 0}%
                              </p>
                              <p className="text-sm text-gray-600">Team Win Rate</p>
                         </CardBody>
                    </Card>
               </div>

               {/* Top Players by Category */}
               <Card>
                    <CardHeader>
                         <h3 className="text-lg font-semibold">Top Performers</h3>
                    </CardHeader>
                    <CardBody>
                         <Tabs variant="underlined">
                              <Tab key="winrate" title="By Win Rate">
                                   <div className="mt-4">
                                        {playersData.topPerformers.byWinPercentage.map((player, index) => (
                                             <PlayerCard key={player.id} player={player} rank={index + 1} />
                                        ))}
                                        {playersData.topPerformers.byWinPercentage.length === 0 && (
                                             <p className="text-gray-500 text-center py-4">No players with sufficient games played</p>
                                        )}
                                   </div>
                              </Tab>
                              
                              <Tab key="frameswon" title="Most Wins">
                                   <div className="mt-4">
                                        {playersData.topPerformers.byFramesWon.map((player, index) => (
                                             <PlayerCard key={player.id} player={player} rank={index + 1} />
                                        ))}
                                   </div>
                              </Tab>
                              
                              <Tab key="avgscore" title="Avg Score">
                                   <div className="mt-4">
                                        {playersData.topPerformers.byAverageScore.map((player, index) => (
                                             <PlayerCard key={player.id} player={player} rank={index + 1} />
                                        ))}
                                   </div>
                              </Tab>
                              
                              <Tab key="active" title="Most Active">
                                   <div className="mt-4">
                                        {playersData.topPerformers.mostActive.map((player, index) => (
                                             <PlayerCard key={player.id} player={player} rank={index + 1} />
                                        ))}
                                   </div>
                              </Tab>
                         </Tabs>
                    </CardBody>
               </Card>
          </div>
     );
};

export default TopPlayers;
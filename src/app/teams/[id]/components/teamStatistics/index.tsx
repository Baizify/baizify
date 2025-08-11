'use client'

import { Card, CardBody, Spinner } from "@heroui/react";
import { FaTrophy, FaChartLine, FaUsers, FaFire } from "react-icons/fa";
import { useState, useEffect } from "react";

interface TeamStats {
     teamName: string;
     currentSeasons: string[];
     totalCampaigns: number;
     activeCampaigns: number;
     allTimeRecord: {
          played: number;
          won: number;
          lost: number;
          drawn: number;
          winPercentage: number;
     };
     framesWon: number;
     framesLost: number;
     frameWinPercentage: number;
     totalFrames: number;
}

const TeamStatistics = ({ teamId }: { teamId: string }) => {
     const [stats, setStats] = useState<TeamStats | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchStats = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/stats`);
                    if (response.ok) {
                         const data = await response.json();
                         setStats(data);
                    }
               } catch (error) {
                    console.error('Error fetching team stats:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchStats();
     }, [teamId]);

     if (loading) {
          return (
               <>
                    {[1, 2, 3, 4].map(i => (
                         <Card key={i}>
                              <CardBody className="flex items-center justify-center p-6">
                                   <Spinner size="sm" />
                              </CardBody>
                         </Card>
                    ))}
               </>
          );
     }

     if (!stats) {
          return (
               <>
                    {[1, 2, 3, 4].map(i => (
                         <Card key={i}>
                              <CardBody className="text-center p-6">
                                   <p className="text-gray-500">No data</p>
                              </CardBody>
                         </Card>
                    ))}
               </>
          );
     }

     const statCards = [
          {
               title: "Win Rate",
               value: `${stats.allTimeRecord.winPercentage}%`,
               subtitle: `${stats.allTimeRecord.won}W-${stats.allTimeRecord.lost}L-${stats.allTimeRecord.drawn}D`,
               icon: FaTrophy,
               color: "text-green-600",
               bgColor: "bg-green-50"
          },
          {
               title: "Active Campaigns", 
               value: stats.activeCampaigns.toString(),
               subtitle: stats.currentSeasons.length > 0 ? stats.currentSeasons.join(", ") : "No active seasons",
               icon: FaChartLine,
               color: "text-blue-600",
               bgColor: "bg-blue-50"
          },
          {
               title: "Frame Win Rate",
               value: `${stats.frameWinPercentage}%`,
               subtitle: `${stats.framesWon}/${stats.totalFrames} frames`,
               icon: FaFire,
               color: "text-orange-600", 
               bgColor: "bg-orange-50"
          },
          {
               title: "Total Campaigns",
               value: stats.totalCampaigns.toString(),
               subtitle: `All-time participation`,
               icon: FaUsers,
               color: "text-purple-600",
               bgColor: "bg-purple-50"
          }
     ];

     return (
          <>
               {statCards.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                         <Card key={index}>
                              <CardBody className="p-6">
                                   <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                             <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                             <p className="text-2xl font-bold mb-1">{stat.value}</p>
                                             <p className="text-xs text-gray-500">{stat.subtitle}</p>
                                        </div>
                                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                             <IconComponent className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                   </div>
                              </CardBody>
                         </Card>
                    );
               })}
          </>
     );
};

export default TeamStatistics;
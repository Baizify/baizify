'use client'

import { Team } from "@/generator/prisma";
import { Card, CardBody, CardHeader, Tabs, Tab } from "@heroui/react";
import { FaShieldAlt, FaTrophy, FaUsers, FaChartLine, FaHistory, FaCalendarAlt, FaChartArea } from "react-icons/fa";
import { format } from "date-fns";
import CurrentCampaigns from "../currentCampaigns";
import HistoricCampaigns from "../historicCampaigns";
import TopPlayers from "../topPlayers";
import TeamStatistics from "../teamStatistics";
import RecentFixtures from "../recentFixtures";
import UpcomingFixtures from "../upcomingFixtures";
import LeaguePositionChart from "../leaguePositionChart";

const TeamContainer = ({
     team
}: {
     team: Team
}) => {
     return (
          <div className="max-w-7xl mx-auto p-4">
               {/* Team Header */}
               <div className="mb-8">
                    <Card>
                         <CardBody>
                              <div className="flex items-center gap-6">
                                   <div className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                             <FaShieldAlt size={40} className="text-white" />
                                        </div>
                                   </div>
                                   <div className="flex-1">
                                        <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
                                        <p className="text-gray-600 mb-2">
                                             Founded: {format(new Date(team.createdAt), "dd MMMM yyyy")}
                                        </p>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                             <span>Team ID: {team.id.slice(-8)}</span>
                                             <span>Last Updated: {format(new Date(team.updatedAt || team.createdAt), "dd/MM/yyyy")}</span>
                                        </div>
                                   </div>
                              </div>
                         </CardBody>
                    </Card>
               </div>

               {/* Team Statistics Overview Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <TeamStatistics teamId={team.id} />
               </div>

               {/* Main Content Tabs */}
               <Tabs variant="underlined" className="w-full">
                    <Tab 
                         key="overview" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaChartLine size={16} />
                                   <span>Overview</span>
                              </div>
                         }
                    >
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                              {/* Recent Fixtures */}
                              <Card>
                                   <CardHeader>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                             <FaHistory size={18} />
                                             Recent Fixtures
                                        </h3>
                                   </CardHeader>
                                   <CardBody className="p-0">
                                        <RecentFixtures teamId={team.id} />
                                   </CardBody>
                              </Card>

                              {/* Upcoming Fixtures */}
                              <Card>
                                   <CardHeader>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                             <FaCalendarAlt size={18} />
                                             Upcoming Fixtures
                                        </h3>
                                   </CardHeader>
                                   <CardBody className="p-0">
                                        <UpcomingFixtures teamId={team.id} />
                                   </CardBody>
                              </Card>
                         </div>
                    </Tab>

                    <Tab 
                         key="campaigns" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaTrophy size={16} />
                                   <span>Current Campaigns</span>
                              </div>
                         }
                    >
                         <div className="mt-6">
                              <CurrentCampaigns teamId={team.id} />
                         </div>
                    </Tab>

                    <Tab 
                         key="history" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaHistory size={16} />
                                   <span>Campaign History</span>
                              </div>
                         }
                    >
                         <div className="mt-6">
                              <HistoricCampaigns teamId={team.id} />
                         </div>
                    </Tab>

                    <Tab 
                         key="league-positions" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaChartArea size={16} />
                                   <span>League History</span>
                              </div>
                         }
                    >
                         <div className="mt-6">
                              <LeaguePositionChart teamId={team.id} />
                         </div>
                    </Tab>

                    <Tab 
                         key="players" 
                         title={
                              <div className="flex items-center gap-2">
                                   <FaUsers size={16} />
                                   <span>Top Players</span>
                              </div>
                         }
                    >
                         <div className="mt-6">
                              <TopPlayers teamId={team.id} />
                         </div>
                    </Tab>
               </Tabs>
          </div>
     );
};

export default TeamContainer;
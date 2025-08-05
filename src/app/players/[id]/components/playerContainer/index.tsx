'use client'

import { User } from "@/generator/prisma";
import { Card, CardBody, CardHeader, Tabs, Tab, Avatar, Chip, Button } from "@heroui/react";
import { FaUser, FaTrophy, FaChartLine, FaHistory, FaCalendarAlt, FaCog, FaMedal, FaChartBar } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";
import PlayerStats from "../playerStats";
import PlayerHistory from "../playerHistory";
import RecentMatches from "../recentMatches";
import PlayerAchievements from "../playerAchievements";
import HandicapChart from "@/components/handicapChart";

interface CampaignWithDetails {
    id: string;
    createdAt: string;
    campaign: {
        id: string;
        competition: {
            id: string;
            name: string;
        };
        season: {
            id: string;
            name: string;
        };
        teamCampaign?: {
            team: {
                id: string;
                name: string;
            };
        } | null;
    };
}

interface PlayerWithCampaigns extends User {
    campaigns: CampaignWithDetails[];
}

const PlayerContainer = ({
    player,
    isOwnProfile,
    isAdmin
}: {
    player: PlayerWithCampaigns;
    isOwnProfile: boolean;
    isAdmin: boolean;
}) => {
    const activeCampaigns = player.campaigns.slice(0, 3); // Show recent 3 campaigns
    const totalCampaigns = player.campaigns.length;

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Player Header */}
            <div className="mb-8">
                <Card>
                    <CardBody>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-shrink-0">
                                <Avatar
                                    src={player.image || undefined}
                                    name={player.name || player.email}
                                    className="w-24 h-24 text-2xl"
                                    isBordered
                                    color="primary"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-bold">
                                        {player.name || 'Player'}
                                    </h1>
                                    {player.isAdmin && (
                                        <Chip
                                            startContent={<FaCog size={12} />}
                                            variant="flat"
                                            color="warning"
                                            size="sm"
                                        >
                                            Admin
                                        </Chip>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt size={12} />
                                        Joined: {format(new Date(player.createdAt), "dd MMMM yyyy")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaTrophy size={12} />
                                        {totalCampaigns} Campaign{totalCampaigns !== 1 ? 's' : ''}
                                    </span>
                                    <span>Email: {player.email}</span>
                                </div>
                                
                                {/* Active Campaigns */}
                                {activeCampaigns.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Campaigns</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activeCampaigns.map((cp) => (
                                                <Chip
                                                    key={cp.id}
                                                    variant="flat"
                                                    color="primary"
                                                    size="sm"
                                                    as={Link}
                                                    href={`/campaigns/${cp.campaign.id}`}
                                                    className="cursor-pointer hover:bg-primary-100"
                                                >
                                                    {cp.campaign.competition.name} - {cp.campaign.season.name}
                                                    {cp.campaign.teamCampaign && (
                                                        <span className="ml-1 text-xs">
                                                            ({cp.campaign.teamCampaign.team.name})
                                                        </span>
                                                    )}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(isOwnProfile || isAdmin) && (
                                <div className="flex gap-2">
                                    <Button
                                        as={Link}
                                        href={`/players/${player.id}/settings`}
                                        variant="bordered"
                                        size="sm"
                                        startContent={<FaCog size={14} />}
                                    >
                                        {isOwnProfile ? 'Profile Settings' : 'Manage Player'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Player Statistics Overview Cards */}
            <div className="mb-8">
                <PlayerStats playerId={player.id} />
            </div>

            {/* Handicap Progress Chart - Prominent KPI Display */}
            <div className="mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <FaChartBar className="text-white text-lg" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Handicap Progress</h3>
                                <p className="text-sm text-gray-600">Track your performance improvement over time</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <HandicapChart playerId={player.id} />
                    </CardBody>
                </Card>
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
                    <div className="mt-6 space-y-6">
                        <RecentMatches playerId={player.id} />
                        <PlayerAchievements playerId={player.id} />
                    </div>
                </Tab>

                <Tab 
                    key="history" 
                    title={
                        <div className="flex items-center gap-2">
                            <FaHistory size={16} />
                            <span>Match History</span>
                        </div>
                    }
                >
                    <div className="mt-6">
                        <PlayerHistory playerId={player.id} />
                    </div>
                </Tab>

                <Tab 
                    key="achievements" 
                    title={
                        <div className="flex items-center gap-2">
                            <FaMedal size={16} />
                            <span>Achievements</span>
                        </div>
                    }
                >
                    <div className="mt-6">
                        <PlayerAchievements playerId={player.id} detailed={true} />
                    </div>
                </Tab>

                <Tab 
                    key="campaigns" 
                    title={
                        <div className="flex items-center gap-2">
                            <FaTrophy size={16} />
                            <span>All Campaigns</span>
                        </div>
                    }
                >
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Campaign History</h3>
                            </CardHeader>
                            <CardBody>
                                {player.campaigns.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaTrophy size={48} className="mx-auto mb-3 text-gray-400" />
                                        <p className="text-gray-500">No campaigns found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {player.campaigns.map((cp) => (
                                            <div key={cp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <Link 
                                                        href={`/campaigns/${cp.campaign.id}`}
                                                        className="font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        {cp.campaign.competition.name}
                                                    </Link>
                                                    <div className="text-sm text-gray-500">
                                                        {cp.campaign.season.name}
                                                        {cp.campaign.teamCampaign && (
                                                            <>
                                                                {' • '}
                                                                <Link 
                                                                    href={`/teams/${cp.campaign.teamCampaign.team.id}`}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    {cp.campaign.teamCampaign.team.name}
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Joined: {format(new Date(cp.createdAt), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default PlayerContainer;
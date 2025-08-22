'use client'

import { Card, CardBody, CardHeader, Chip, Avatar, Button } from "@heroui/react";
import { FaTrophy, FaUsers, FaCalendarAlt, FaCog, FaShieldAlt, FaFire, FaChartLine, FaClock, FaStar } from "react-icons/fa";
import { formatDistanceToNow, format, isWithinInterval, subDays } from 'date-fns';
import Link from "next/link";

interface Competition {
    id: string;
    name: string;
    description?: string;
    sortOrder: number;
    collection: string;
    createdAt: string;
    campaigns: Array<{
        id: string;
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
        players: Array<{
            id: string;
        }>;
    }>;
    fixtures: Array<{
        id: string;
        scheduledDate: string;
        status: string;
        season: {
            id: string;
            name: string;
        };
    }>;
    _count: {
        campaigns: number;
        fixtures: number;
    };
}

const CompetitionCards = ({ 
    competitions, 
    isAdmin 
}: { 
    competitions: Competition[];
    isAdmin: boolean;
}) => {
    const getCompetitionLevel = (sortOrder: number) => {
        if (sortOrder === 1) return { label: 'Premier', color: 'warning' as const, icon: FaStar };
        if (sortOrder <= 3) return { label: 'Elite', color: 'primary' as const, icon: FaTrophy };
        if (sortOrder <= 6) return { label: 'Championship', color: 'secondary' as const, icon: FaShieldAlt };
        return { label: 'League', color: 'default' as const, icon: FaUsers };
    };

    const getActivityStatus = (fixtures: Competition['fixtures']) => {
        const now = new Date();
        const last7Days = subDays(now, 7);
        
        const recentFixtures = fixtures.filter(fixture => 
            fixture.scheduledDate && 
            isWithinInterval(new Date(fixture.scheduledDate), { start: last7Days, end: now })
        );

        const liveFixtures = fixtures.filter(fixture => fixture.status === 'in_progress');
        
        if (liveFixtures.length > 0) {
            return { label: 'LIVE', color: 'danger' as const, icon: FaFire };
        }
        
        if (recentFixtures.length > 0) {
            return { label: 'Active', color: 'success' as const, icon: FaChartLine };
        }
        
        return { label: 'Scheduled', color: 'default' as const, icon: FaClock };
    };

    const getUniqueSeasons = (campaigns: Competition['campaigns']) => {
        const seasonMap = new Map();
        campaigns.forEach(campaign => {
            seasonMap.set(campaign.season.id, campaign.season);
        });
        return Array.from(seasonMap.values());
    };

    const getUniqueTeams = (campaigns: Competition['campaigns']) => {
        const teamMap = new Map();
        campaigns.forEach(campaign => {
            if (campaign.teamCampaign?.team) {
                teamMap.set(campaign.teamCampaign.team.id, campaign.teamCampaign.team);
            }
        });
        return Array.from(teamMap.values());
    };

    const getTotalPlayers = (campaigns: Competition['campaigns']) => {
        const playerSet = new Set();
        campaigns.forEach(campaign => {
            campaign.players.forEach(player => {
                playerSet.add(player.id);
            });
        });
        return playerSet.size;
    };

    if (competitions.length === 0) {
        return (
            <div className="text-center py-12">
                <FaTrophy size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No competitions yet</h3>
                <p className="text-gray-500">
                    {isAdmin 
                        ? 'Click the "Create Competition" button above to get started'
                        : 'Competitions will appear here when they are created'
                    }
                </p>
            </div>
        );
    }

    // Group competitions by collection
    const competitionsByCollection = competitions.reduce((acc, competition) => {
        const collection = competition.collection || 'Default';
        if (!acc[collection]) {
            acc[collection] = [];
        }
        acc[collection].push(competition);
        return acc;
    }, {} as Record<string, Competition[]>);

    return (
        <div className="space-y-8">
            {Object.entries(competitionsByCollection).map(([collection, collectionCompetitions]) => (
                <div key={collection}>
                    {Object.keys(competitionsByCollection).length > 1 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{collection}</h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collectionCompetitions.map((competition) => {
                            const level = getCompetitionLevel(competition.sortOrder);
                            const activity = getActivityStatus(competition.fixtures);
                            const seasons = getUniqueSeasons(competition.campaigns);
                            const teams = getUniqueTeams(competition.campaigns);
                            const totalPlayers = getTotalPlayers(competition.campaigns);
                            const LevelIcon = level.icon;
                            const ActivityIcon = activity.icon;

                            return (
                                <Card 
                                    key={competition.id} 
                                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <LevelIcon className="text-white" size={20} />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1">
                                                        <Chip
                                                            size="sm"
                                                            variant="solid"
                                                            color={activity.color}
                                                            className="min-w-0 h-5 px-1"
                                                        >
                                                            <ActivityIcon size={10} />
                                                        </Chip>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                        {competition.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={level.color}
                                                            startContent={<LevelIcon size={12} />}
                                                        >
                                                            {level.label}
                                                        </Chip>
                                                        <span className="text-xs text-gray-500">
                                                            #{competition.sortOrder}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
                                                    as={Link}
                                                    href={`/competitions/${competition.id}/settings`}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FaCog size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardBody className="pt-0">
                                        {competition.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {competition.description}
                                            </p>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center justify-center mb-1">
                                                    <FaUsers className="text-blue-600 mr-1" size={14} />
                                                    <span className="text-xs font-medium text-blue-800">Teams</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-900">{teams.length}</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center justify-center mb-1">
                                                    <FaShieldAlt className="text-green-600 mr-1" size={14} />
                                                    <span className="text-xs font-medium text-green-800">Players</span>
                                                </div>
                                                <div className="text-lg font-bold text-green-900">{totalPlayers}</div>
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        {competition.fixtures.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Recent Fixtures
                                                </h4>
                                                {competition.fixtures.slice(0, 2).map((fixture) => (
                                                    <div key={fixture.id} className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600 truncate">
                                                            {fixture.season.name}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Chip
                                                                size="sm"
                                                                variant="dot"
                                                                color={fixture.status === 'completed' ? 'success' : 
                                                                       fixture.status === 'in_progress' ? 'warning' : 'default'}
                                                            >
                                                                {fixture.status}
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Seasons */}
                                        {seasons.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                                    Seasons ({seasons.length})
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {seasons.slice(0, 3).map((season) => (
                                                        <Chip
                                                            key={season.id}
                                                            size="sm"
                                                            variant="bordered"
                                                            className="text-xs"
                                                        >
                                                            {season.name}
                                                        </Chip>
                                                    ))}
                                                    {seasons.length > 3 && (
                                                        <Chip
                                                            size="sm"
                                                            variant="light"
                                                            className="text-xs"
                                                        >
                                                            +{seasons.length - 3}
                                                        </Chip>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            color="primary"
                                            as={Link}
                                            href={`/competitions/${competition.id}`}>
                                            View
                                        </Button>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <FaCalendarAlt size={10} />
                                                <span>Created {formatDistanceToNow(new Date(competition.createdAt), { addSuffix: true })}</span>
                                            </div>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={activity.color}
                                                startContent={<ActivityIcon size={10} />}
                                            >
                                                {activity.label}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CompetitionCards;
'use client'

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { FaCalendarAlt, FaTrophy, FaUsers } from "react-icons/fa";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface RecentMatch {
    id: string;
    scheduledDate: string;
    homeScore: number;
    awayScore: number;
    status: string;
    isLive: boolean;
    homeCampaign: {
        teamCampaign?: {
            team: {
                id: string;
                name: string;
            };
        } | null;
    };
    awayCampaign: {
        teamCampaign?: {
            team: {
                id: string;
                name: string;
            };
        } | null;
    };
    competition: {
        id: string;
        name: string;
    };
    season: {
        id: string;
        name: string;
    };
    playerFrames: {
        id: string;
        frameNumber: number;
        homeScore: number;
        awayScore: number;
        winnerId?: string;
        status: string;
        isPlayerHome: boolean;
    }[];
}

const RecentMatches = ({ playerId }: { playerId: string }) => {
    const [matches, setMatches] = useState<RecentMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentMatches = async () => {
            try {
                const response = await fetch(`/api/players/${playerId}/recent-matches`);
                if (response.ok) {
                    const data = await response.json();
                    setMatches(data);
                }
            } catch (error) {
                console.error('Error fetching recent matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentMatches();
    }, [playerId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const getMatchResult = (match: RecentMatch): 'win' | 'loss' | 'draw' | 'pending' => {
        if (match.status !== 'completed') return 'pending';
        
        const playerFramesWon = match.playerFrames.filter(frame => frame.winnerId === playerId).length;
        const opponentFramesWon = match.playerFrames.length - playerFramesWon;
        
        if (playerFramesWon > opponentFramesWon) return 'win';
        if (playerFramesWon < opponentFramesWon) return 'loss';
        return 'draw';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaTrophy size={18} />
                        Recent Matches
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-16 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaTrophy size={18} />
                    Recent Matches
                </h3>
            </CardHeader>
            <CardBody className="p-0">
                {matches.length === 0 ? (
                    <div className="text-center py-8">
                        <FaTrophy size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">No recent matches found.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {matches.map((match) => {
                            const result = getMatchResult(match);
                            const playerFramesWon = match.playerFrames.filter(frame => frame.winnerId === playerId).length;
                            const totalFrames = match.playerFrames.length;
                            const opponentFramesWon = totalFrames - playerFramesWon;
                            
                            return (
                                <Link key={match.id} href={`/fixtures/${match.id}`} className="block hover:bg-gray-50">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    vs {match.homeCampaign.teamCampaign?.team?.name || 'TBD'} / {match.awayCampaign.teamCampaign?.team?.name || 'TBD'}
                                                </span>
                                                {match.isLive && (
                                                    <Chip 
                                                        size="sm" 
                                                        color="danger"
                                                        variant="solid"
                                                        className="animate-pulse"
                                                    >
                                                        🔴 LIVE
                                                    </Chip>
                                                )}
                                                {result !== 'pending' && (
                                                    <Chip
                                                        size="sm"
                                                        color={result === 'win' ? 'success' : result === 'loss' ? 'danger' : 'warning'}
                                                        variant="flat"
                                                    >
                                                        {result.toUpperCase()}
                                                    </Chip>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {match.status === 'completed' && (
                                                    <div className="font-bold">
                                                        {playerFramesWon} - {opponentFramesWon}
                                                    </div>
                                                )}
                                                <Chip 
                                                    size="sm" 
                                                    color={getStatusColor(match.status)}
                                                    variant="flat"
                                                >
                                                    {match.status.replace('_', ' ').toUpperCase()}
                                                </Chip>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt size={12} />
                                                {match.scheduledDate ? 
                                                    format(new Date(match.scheduledDate), "dd MMM yyyy") : 
                                                    'TBD'
                                                }
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaTrophy size={12} />
                                                {match.competition.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaUsers size={12} />
                                                {totalFrames} frames
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default RecentMatches;
'use client'

import { Card, CardBody, CardHeader, Chip, Button, Pagination } from "@heroui/react";
import { FaHistory, FaCalendarAlt, FaTrophy, FaUsers, FaFilter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface HistoricalMatch {
    id: string;
    scheduledDate: string;
    homeScore: number;
    awayScore: number;
    status: string;
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

interface HistoryResponse {
    matches: HistoricalMatch[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

const PlayerHistory = ({ playerId }: { playerId: string }) => {
    const [history, setHistory] = useState<HistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'completed'>('all');

    const fetchHistory = async (page: number = 1, filterType: string = 'all') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                filter: filterType
            });
            
            const response = await fetch(`/api/players/${playerId}/history?${params}`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching player history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage, filter);
    }, [playerId, currentPage, filter]);

    const getMatchResult = (match: HistoricalMatch): 'win' | 'loss' | 'draw' | 'pending' => {
        if (match.status !== 'completed') return 'pending';
        
        const playerFramesWon = match.playerFrames.filter(frame => frame.winnerId === playerId).length;
        const opponentFramesWon = match.playerFrames.length - playerFramesWon;
        
        if (playerFramesWon > opponentFramesWon) return 'win';
        if (playerFramesWon < opponentFramesWon) return 'loss';
        return 'draw';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilter: 'all' | 'wins' | 'losses' | 'completed') => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    if (loading && !history) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaHistory size={18} />
                        Match History
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-20 bg-gray-200 rounded-lg"></div>
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
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaHistory size={18} />
                        Match History {history && `(${history.totalCount} total)`}
                    </h3>
                    <div className="flex items-center gap-2">
                        <FaFilter size={14} className="text-gray-500" />
                        <div className="flex gap-1">
                            {(['all', 'wins', 'losses', 'completed'] as const).map((filterType) => (
                                <Button
                                    key={filterType}
                                    size="sm"
                                    variant={filter === filterType ? 'solid' : 'light'}
                                    color="primary"
                                    onPress={() => handleFilterChange(filterType)}
                                >
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-0">
                {!history || history.matches.length === 0 ? (
                    <div className="text-center py-8">
                        <FaHistory size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">
                            {filter === 'all' ? 'No matches found.' : `No ${filter} found.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y">
                            {history.matches.map((match) => {
                                const result = getMatchResult(match);
                                const playerFramesWon = match.playerFrames.filter(frame => frame.winnerId === playerId).length;
                                const totalFrames = match.playerFrames.length;
                                const opponentFramesWon = totalFrames - playerFramesWon;
                                
                                return (
                                    <Link key={match.id} href={`/fixtures/${match.id}`} className="block hover:bg-gray-50">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-medium text-lg">
                                                            vs {match.homeCampaign.teamCampaign?.team?.name || 'TBD'} / {match.awayCampaign.teamCampaign?.team?.name || 'TBD'}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {match.competition.name} • {match.season.name}
                                                        </div>
                                                    </div>
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
                                                        <div className="text-2xl font-bold mb-1">
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
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt size={12} />
                                                    {match.scheduledDate ? 
                                                        format(new Date(match.scheduledDate), "dd MMMM yyyy 'at' HH:mm") : 
                                                        'Date TBD'
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaUsers size={12} />
                                                    {totalFrames} frames played
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        
                        {history.totalPages > 1 && (
                            <div className="flex justify-center p-4">
                                <Pagination
                                    total={history.totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    showControls
                                    size="sm"
                                />
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default PlayerHistory;
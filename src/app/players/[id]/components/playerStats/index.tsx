'use client'

import { Card, CardBody } from "@heroui/react";
import { FaTrophy, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { useState, useEffect } from "react";

interface PlayerStatsData {
    totalMatches: number;
    wins: number;
    losses: number;
    framesWon: number;
    framesLost: number;
    winRate: number;
    frameWinRate: number;
    currentStreak: number;
    bestStreak: number;
    averageFramesPerMatch: number;
}

const PlayerStats = ({ playerId }: { playerId: string }) => {
    const [stats, setStats] = useState<PlayerStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/players/${playerId}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching player stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [playerId]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardBody className="text-center p-6">
                            <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-20 mx-auto mb-1"></div>
                            <div className="h-6 bg-gray-300 rounded w-12 mx-auto"></div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-gray-500">No statistics available</p>
                </CardBody>
            </Card>
        );
    }

    const statCards = [
        {
            icon: FaTrophy,
            label: "Match Record",
            value: `${stats.wins}-${stats.losses}`,
            subtitle: `${stats.winRate.toFixed(1)}% win rate`,
            color: "text-yellow-500"
        },
        {
            icon: FaTrophy,
            label: "Frame Record",
            value: `${stats.framesWon}-${stats.framesLost}`,
            subtitle: `${stats.frameWinRate.toFixed(1)}% frame rate`,
            color: "text-blue-500"
        },
        {
            icon: FaChartLine,
            label: "Current Streak",
            value: Math.abs(stats.currentStreak).toString(),
            subtitle: stats.currentStreak >= 0 ? "wins" : "losses",
            color: stats.currentStreak >= 0 ? "text-green-500" : "text-red-500"
        },
        {
            icon: FaCalendarAlt,
            label: "Avg Frames/Match",
            value: stats.averageFramesPerMatch.toFixed(1),
            subtitle: `Best streak: ${stats.bestStreak}`,
            color: "text-purple-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardBody className="text-center p-6">
                        <div className="flex items-center justify-center mb-2">
                            <stat.icon className={`${stat.color} mr-2`} size={20} />
                            <span className="text-sm font-medium">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.subtitle}</div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default PlayerStats;
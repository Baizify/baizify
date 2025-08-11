'use client'

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { FaMedal, FaTrophy, FaFire, FaStar, FaCrown } from "react-icons/fa";
import { useState, useEffect } from "react";

interface Achievement {
    id: string;
    title: string;
    description: string;
    type: 'trophy' | 'milestone' | 'streak' | 'skill' | 'special';
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    icon: string;
    dateEarned: string;
    progress?: {
        current: number;
        target: number;
    };
}

interface AchievementsData {
    earned: Achievement[];
    inProgress: Achievement[];
    totalEarned: number;
    totalPossible: number;
}

const PlayerAchievements = ({ 
    playerId, 
    detailed = false 
}: { 
    playerId: string;
    detailed?: boolean;
}) => {
    const [achievements, setAchievements] = useState<AchievementsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const response = await fetch(`/api/players/${playerId}/achievements`);
                if (response.ok) {
                    const data = await response.json();
                    setAchievements(data);
                }
            } catch (error) {
                console.error('Error fetching achievements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [playerId]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'trophy': return FaTrophy;
            case 'milestone': return FaTrophy;
            case 'streak': return FaFire;
            case 'skill': return FaStar;
            case 'special': return FaCrown;
            default: return FaMedal;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'bronze': return 'warning';
            case 'silver': return 'default';
            case 'gold': return 'primary';
            case 'platinum': return 'secondary';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaMedal size={18} />
                        Achievements
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (!achievements) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaMedal size={18} />
                        Achievements
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="text-center py-8">
                        <FaMedal size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">No achievements data available</p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    const displayAchievements = detailed 
        ? [...achievements.earned, ...achievements.inProgress]
        : achievements.earned.slice(0, 6);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaMedal size={18} />
                        Achievements
                    </h3>
                    <div className="flex items-center gap-2">
                        <Chip variant="flat" color="primary" size="sm">
                            {achievements.totalEarned} / {achievements.totalPossible}
                        </Chip>
                        <div className="text-sm text-gray-500">
                            {((achievements.totalEarned / achievements.totalPossible) * 100).toFixed(0)}% Complete
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                {displayAchievements.length === 0 ? (
                    <div className="text-center py-8">
                        <FaMedal size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">No achievements yet. Keep playing to earn your first achievement!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayAchievements.map((achievement) => {
                                const TypeIcon = getTypeIcon(achievement.type);
                                const isEarned = achievements.earned.some(a => a.id === achievement.id);
                                
                                return (
                                    <Card 
                                        key={achievement.id} 
                                        className={`${!isEarned ? 'opacity-60 border-dashed' : ''}`}
                                    >
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${isEarned ? 'bg-primary-100' : 'bg-gray-100'}`}>
                                                    <TypeIcon 
                                                        size={24} 
                                                        className={isEarned ? 'text-primary-600' : 'text-gray-400'} 
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm truncate">
                                                            {achievement.title}
                                                        </h4>
                                                        {isEarned && (
                                                            <Chip
                                                                size="sm"
                                                                color={getLevelColor(achievement.level)}
                                                                variant="solid"
                                                                className="text-xs"
                                                            >
                                                                {achievement.level}
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {achievement.description}
                                                    </p>
                                                    
                                                    {isEarned ? (
                                                        <p className="text-xs text-green-600 font-medium">
                                                            Earned {new Date(achievement.dateEarned).toLocaleDateString()}
                                                        </p>
                                                    ) : achievement.progress && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span>Progress</span>
                                                                <span>{achievement.progress.current} / {achievement.progress.target}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {!detailed && achievements.earned.length > 6 && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Showing 6 of {achievements.earned.length} earned achievements
                                </p>
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default PlayerAchievements;
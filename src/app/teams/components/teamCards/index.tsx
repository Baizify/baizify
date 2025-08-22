'use client'

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { FaUsers, FaCog, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

interface Team {
    id: string;
    name: string;
    createdAt: string | Date;
}

const TeamCards = ({ 
    teams, 
    isAdmin 
}: { 
    teams: Team[];
    isAdmin: boolean;
}) => {
    if (teams.length === 0) {
        return (
            <div className="text-center py-12">
                <FaUsers size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No teams yet</h3>
                <p className="text-gray-500">
                    {isAdmin 
                        ? 'Click the "Create Team" button above to get started'
                        : 'Teams will appear here when they are created'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
                <Card 
                    key={team.id} 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm"
                >
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                    <FaShieldAlt className="text-white" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {team.name}
                                    </h3>
                                </div>
                            </div>
                            {isAdmin && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    as={Link}
                                    href={`/teams/${team.id}/settings`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaCog size={14} />
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardBody className="pt-0">
                        <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
                            <div className="flex items-center justify-center mb-1">
                                <FaUsers className="text-blue-600 mr-1" size={14} />
                                <span className="text-xs font-medium text-blue-800">Team</span>
                            </div>
                            <div className="text-lg font-bold text-blue-900">{team.name}</div>
                        </div>

                        <Button
                            color="primary"
                            as={Link}
                            href={`/teams/${team.id}`}
                            className="w-full"
                        >
                            View Team
                        </Button>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default TeamCards;
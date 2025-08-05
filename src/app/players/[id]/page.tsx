import prisma from "@/providers/prisma";
import PlayerContainer from "./components/playerContainer";
import { auth } from "@/auth";

const PlayerPage = async ({
    params
}: {
    params: Promise<{
        id: string
    }>
}) => {
    const { id } = await params;
    const session = await auth();

    const player = await prisma.user.findUnique({
        where: { id },
        include: {
            campaigns: {
                include: {
                    campaign: {
                        include: {
                            competition: true,
                            season: true,
                            teamCampaign: {
                                include: {
                                    team: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!player) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h1>
                    <p className="text-gray-600">The player youre looking for doesnt exist.</p>
                </div>
            </div>
        );
    }

    const isOwnProfile = session?.user?.id === player.id;
    const isAdmin = session?.user ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
    }).then(u => u?.isAdmin || false) : false;

    await prisma.$disconnect();

    return (
        <PlayerContainer 
            player={player as any} 
            isOwnProfile={isOwnProfile}
            isAdmin={isAdmin}
        />
    );
};

export default PlayerPage;
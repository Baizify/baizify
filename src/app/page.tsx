import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { Button, Card, CardBody, Avatar, Chip } from "@heroui/react";
import Link from "next/link";
import { FaTrophy, FaUsers, FaClock, FaArrowRight, FaCalendarAlt, FaStar, FaChartLine, FaBolt } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";
import { format } from "date-fns";

const HomePage = async () => {
  const session = await auth();
  
  // Fetch recent fixtures
  const recentFixtures = await prisma.fixture.findMany({
    take: 6,
    orderBy: {
      scheduledDate: 'desc'
    },
    where: {
      scheduledDate: {
        lte: new Date()
      },
      isCompleted: true
    },
    include: {
      homeCampaign: true,
      awayCampaign: true,
      competition: true,
      season: true
    }
  });

  // Fetch upcoming fixtures
  const upcomingFixtures = await prisma.fixture.findMany({
    take: 4,
    orderBy: {
      scheduledDate: 'asc'
    },
    where: {
      scheduledDate: {
        gte: new Date()
      },
      isCompleted: false
    },
    include: {
      homeCampaign: true,
      awayCampaign: true,
      competition: true,
      season: true
    }
  });

  // Fetch active competitions
  const activeCompetitions = await prisma.competition.findMany({
    take: 3,
    orderBy: {
      sortOrder: 'asc'
    },
    include: {
      campaigns: {
        include: {
          season: true
        },
        take: 1
      },
      _count: {
        select: {
          campaigns: true,
          fixtures: {
            where: {
              scheduledDate: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      }
    }
  });

  // Fetch top players (simplified stats)
  const topPlayers = await prisma.user.findMany({
    take: 4,
    where: {
      campaigns: {
        some: {}
      }
    },
    include: {
      _count: {
        select: {
          campaigns: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  await prisma.$disconnect();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-blue-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FaBolt className="text-white text-3xl" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FaTrophy className="text-white text-sm" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Ossett & District
              <span className="block text-yellow-400">Snooker League</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The premier snooker league management system. Track competitions, follow your favorite teams, and celebrate the finest cue sport traditions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session?.user ? (
                <>
                  <Button 
                    as={Link} 
                    href="/auth/signup"
                    size="lg"
                    className="bg-white text-blue-600 font-semibold px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    Join the League
                    <FaArrowRight className="ml-2" />
                  </Button>
                  <Button 
                    as={Link} 
                    href="/competitions"
                    variant="bordered"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 transition-all duration-200"
                  >
                    View Competitions
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    as={Link} 
                    href="/competitions"
                    size="lg"
                    className="bg-white text-blue-600 font-semibold px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    View Competitions
                    <FaTrophy className="ml-2" />
                  </Button>
                  <Button 
                    as={Link} 
                    href={`/players/${session.user.id}`}
                    variant="bordered"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 transition-all duration-200"
                  >
                    My Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{activeCompetitions.length}+</h3>
              <p className="text-gray-600">Active Competitions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{topPlayers.length * 10}+</h3>
              <p className="text-gray-600">Active Players</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{recentFixtures.length * 5}+</h3>
              <p className="text-gray-600">Matches Played</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Recent Results */}
        {recentFixtures.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Results</h2>
                <p className="text-gray-600">Latest completed matches across all competitions</p>
              </div>
              <Button 
                as={Link} 
                href="/fixtures" 
                variant="light" 
                endContent={<FaChevronRight />}
                className="text-blue-600 font-medium"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* {recentFixtures.map((fixture) => (
                <Card key={fixture.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <Chip size="sm" variant="flat" color="primary">
                        {fixture.competition.name}
                      </Chip>
                      <span className="text-sm text-gray-500">
                        {fixture?.scheduledDate && format(new Date(fixture?.scheduledDate), 'MMM d')}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-blue-600 text-sm" />
                          </div>
                          <span className="font-medium">{fixture.homeCampaign?.name || 'TBD'}</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{fixture.homeScore}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-gray-600 text-sm" />
                          </div>
                          <span className="font-medium">{fixture.awayCampaign?.name || 'TBD'}</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{fixture.awayScore}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))} */}
            </div>
          </section>
        )}

        {/* Upcoming Fixtures */}
        {/* {upcomingFixtures.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Fixtures</h2>
                <p className="text-gray-600">Don't miss these exciting upcoming matches</p>
              </div>
              <Button 
                as={Link} 
                href="/fixtures" 
                variant="light" 
                endContent={<FaChevronRight />}
                className="text-blue-600 font-medium"
              >
                View Schedule
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingFixtures.map((fixture) => (
                <Card key={fixture.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <Chip size="sm" variant="flat" color="warning">
                        {fixture.competition.name}
                      </Chip>
                      <div className="flex items-center gap-1 text-orange-600">
                        <FaClock className="text-sm" />
                        <span className="text-sm font-medium">
                          {fixture.scheduledDate && format(new Date(fixture.scheduledDate), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-blue-600 text-sm" />
                          </div>
                          <span className="font-medium">{fixture.homeTeam?.name || 'TBD'}</span>
                        </div>
                        <span className="text-sm text-gray-500">vs</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-gray-600 text-sm" />
                          </div>
                          <span className="font-medium">{fixture.awayTeam?.name || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )} */}

        {/* Active Competitions */}
        {activeCompetitions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Competitions</h2>
                <p className="text-gray-600">Currently active leagues and tournaments</p>
              </div>
              <Button 
                as={Link} 
                href="/competitions" 
                variant="light" 
                endContent={<FaChevronRight />}
                className="text-blue-600 font-medium"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCompetitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FaTrophy className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{competition.name}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Campaigns</span>
                        <p className="text-lg font-semibold text-gray-900">{(competition as any)._count.campaigns}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Recent Fixtures</span>
                        <p className="text-lg font-semibold text-gray-900">{(competition as any)._count.fixtures}</p>
                      </div>
                    </div>
                    
                    <Button 
                      as={Link} 
                      href={`/competitions/${competition.id}`}
                      variant="light" 
                      color="primary"
                      className="w-full"
                      endContent={<FaArrowRight />}
                    >
                      View Details
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <FaStar className="text-4xl text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Action?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether youre a seasoned player or just starting out, theres a place for you in the Ossett & District Snooker League.
          </p>
          
          {!session?.user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                as={Link} 
                href="/auth/signup"
                size="lg"
                className="bg-white text-blue-600 font-semibold px-8 hover:shadow-xl transition-all duration-200"
              >
                Sign Up Today
              </Button>
              <Button 
                as={Link} 
                href="/competitions"
                variant="bordered"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
              >
                Browse Competitions
              </Button>
            </div>
          ) : (
            <Button 
              as={Link} 
              href="/competitions"
              size="lg"
              className="bg-white text-blue-600 font-semibold px-8 hover:shadow-xl transition-all duration-200"
            >
              Explore Competitions
              <FaTrophy className="ml-2" />
            </Button>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;

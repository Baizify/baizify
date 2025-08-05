'use client'

import { Spinner, Chip } from "@heroui/react";
import { FaHome, FaMapMarkerAlt, FaClock, FaPlay } from "react-icons/fa";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface UpcomingFixture {
     id: string;
     competition: { id: string; name: string };
     season: { id: string; name: string };
     opponent: { id: string; name: string } | null;
     isHome: boolean;
     scheduledDate?: string;
     status: string;
     isLive: boolean;
     venue?: string;
     timeUntil?: string;
     totalFrames: number;
}

interface UpcomingData {
     nextFixture: UpcomingFixture | null;
     thisWeek: UpcomingFixture[];
     allUpcoming: UpcomingFixture[];
     summary: {
          totalUpcoming: number;
          thisWeekCount: number;
          liveFixtures: number;
          homeFixtures: number;
          awayFixtures: number;
     };
}

const UpcomingFixtures = ({ teamId }: { teamId: string }) => {
     const [upcomingData, setUpcomingData] = useState<UpcomingData | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchUpcomingFixtures = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/fixtures/upcoming`);
                    if (response.ok) {
                         const data = await response.json();
                         setUpcomingData(data);
                    }
               } catch (error) {
                    console.error('Error fetching upcoming fixtures:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchUpcomingFixtures();
     }, [teamId]);

     const getStatusColor = (status: string, isLive: boolean) => {
          if (isLive) return 'danger';
          switch (status) {
               case 'in_progress': return 'warning';
               case 'scheduled': return 'primary';
               default: return 'default';
          }
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center py-8">
                    <Spinner size="md" />
               </div>
          );
     }

     if (!upcomingData || upcomingData.allUpcoming.length === 0) {
          return (
               <div className="text-center py-8 px-4">
                    <p className="text-gray-500">No upcoming fixtures scheduled</p>
               </div>
          );
     }

     return (
          <div className="space-y-4 p-4">
               {/* Next Fixture Highlight */}
               {upcomingData.nextFixture && (
                    <div className="mb-6">
                         <h4 className="text-sm font-semibold text-gray-600 mb-2">Next Fixture</h4>
                         <Link href={`/fixtures/${upcomingData.nextFixture.id}`}>
                              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                                   <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                             {upcomingData.nextFixture.isLive && (
                                                  <Chip 
                                                       size="sm" 
                                                       color="danger"
                                                       variant="solid"
                                                       className="animate-pulse"
                                                  >
                                                       <FaPlay size={8} className="mr-1" />
                                                       LIVE
                                                  </Chip>
                                             )}
                                             <Chip 
                                                  size="sm" 
                                                  color={getStatusColor(upcomingData.nextFixture.status, upcomingData.nextFixture.isLive)}
                                                  variant="flat"
                                             >
                                                  {upcomingData.nextFixture.status.replace('_', ' ').toUpperCase()}
                                             </Chip>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                             {upcomingData.nextFixture.isHome ? <FaHome size={10} /> : <FaMapMarkerAlt size={10} />}
                                             <span>{upcomingData.nextFixture.isHome ? 'Home' : 'Away'}</span>
                                        </div>
                                   </div>

                                   <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold">
                                             vs {upcomingData.nextFixture.opponent?.name || 'TBD'}
                                        </span>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                             <FaClock size={12} />
                                             <span>{upcomingData.nextFixture.timeUntil || 'TBD'}</span>
                                        </div>
                                   </div>

                                   {upcomingData.nextFixture.scheduledDate && (
                                        <div className="text-sm text-gray-600 mb-2">
                                             {format(new Date(upcomingData.nextFixture.scheduledDate), 'EEEE, dd MMMM yyyy \'at\' HH:mm')}
                                        </div>
                                   )}

                                   <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{upcomingData.nextFixture.competition.name} - {upcomingData.nextFixture.season.name}</span>
                                        <span>{upcomingData.nextFixture.totalFrames} frames</span>
                                   </div>

                                   {upcomingData.nextFixture.venue && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                             <FaMapMarkerAlt size={8} />
                                             <span>{upcomingData.nextFixture.venue}</span>
                                        </div>
                                   )}
                              </div>
                         </Link>
                    </div>
               )}

               {/* Other Upcoming Fixtures */}
               <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-600">All Upcoming</h4>
                    {upcomingData.allUpcoming.slice(upcomingData.nextFixture ? 1 : 0, 5).map((fixture) => (
                         <Link key={fixture.id} href={`/fixtures/${fixture.id}`}>
                              <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                   <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                             {fixture.isLive && (
                                                  <Chip 
                                                       size="sm" 
                                                       color="danger"
                                                       variant="solid"
                                                       className="animate-pulse"
                                                  >
                                                       <FaPlay size={6} className="mr-1" />
                                                       LIVE
                                                  </Chip>
                                             )}
                                             <span className="text-xs text-gray-500">
                                                  {fixture.scheduledDate 
                                                       ? format(new Date(fixture.scheduledDate), 'dd MMM') 
                                                       : 'TBD'
                                                  }
                                             </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                             {fixture.isHome ? <FaHome size={8} /> : <FaMapMarkerAlt size={8} />}
                                             <span>{fixture.isHome ? 'H' : 'A'}</span>
                                        </div>
                                   </div>

                                   <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                             vs {fixture.opponent?.name || 'TBD'}
                                        </span>
                                        {fixture.timeUntil && (
                                             <span className="text-xs text-gray-500">{fixture.timeUntil}</span>
                                        )}
                                   </div>

                                   <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{fixture.competition.name}</span>
                                        <Chip 
                                             size="sm" 
                                             color={getStatusColor(fixture.status, fixture.isLive)}
                                             variant="flat"
                                        >
                                             {fixture.status.replace('_', ' ')}
                                        </Chip>
                                   </div>
                              </div>
                         </Link>
                    ))}
               </div>

               {/* Summary */}
               <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                         <div>
                              <p className="font-semibold text-gray-700">{upcomingData.summary.totalUpcoming}</p>
                              <p className="text-gray-500">Total</p>
                         </div>
                         <div>
                              <p className="font-semibold text-gray-700">{upcomingData.summary.homeFixtures}</p>
                              <p className="text-gray-500">Home</p>
                         </div>
                         <div>
                              <p className="font-semibold text-gray-700">{upcomingData.summary.awayFixtures}</p>
                              <p className="text-gray-500">Away</p>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default UpcomingFixtures;
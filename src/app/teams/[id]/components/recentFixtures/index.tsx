'use client'

import { Spinner, Chip } from "@heroui/react";
import { FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface RecentFixture {
     id: string;
     competition: { id: string; name: string };
     season: { id: string; name: string };
     opponent: { id: string; name: string } | null;
     isHome: boolean;
     teamScore: number;
     opponentScore: number;
     result: 'W' | 'L' | 'D';
     completedAt: string;
     venue?: string;
}

const RecentFixtures = ({ teamId }: { teamId: string }) => {
     const [fixtures, setFixtures] = useState<RecentFixture[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchRecentFixtures = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/fixtures/recent`);
                    if (response.ok) {
                         const data = await response.json();
                         setFixtures(data);
                    }
               } catch (error) {
                    console.error('Error fetching recent fixtures:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchRecentFixtures();
     }, [teamId]);

     const getResultColor = (result: string) => {
          switch (result) {
               case 'W': return 'success';
               case 'L': return 'danger';
               case 'D': return 'warning';
               default: return 'default';
          }
     };

     const getResultText = (result: string) => {
          switch (result) {
               case 'W': return 'Win';
               case 'L': return 'Loss';
               case 'D': return 'Draw';
               default: return 'Unknown';
          }
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center py-8">
                    <Spinner size="md" />
               </div>
          );
     }

     if (fixtures.length === 0) {
          return (
               <div className="text-center py-8 px-4">
                    <p className="text-gray-500">No recent fixtures found</p>
               </div>
          );
     }

     return (
          <div className="space-y-3 p-4">
               {fixtures.map((fixture) => (
                    <Link key={fixture.id} href={`/fixtures/${fixture.id}`}>
                         <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-2">
                                        <Chip 
                                             size="sm" 
                                             color={getResultColor(fixture.result)}
                                             variant="solid"
                                        >
                                             {fixture.result}
                                        </Chip>
                                        <span className="text-sm text-gray-500">
                                             {format(new Date(fixture.completedAt), 'dd MMM yyyy')}
                                        </span>
                                   </div>
                                   <div className="flex items-center gap-1 text-xs text-gray-500">
                                        {fixture.isHome ? <FaHome size={10} /> : <FaMapMarkerAlt size={10} />}
                                        <span>{fixture.isHome ? 'Home' : 'Away'}</span>
                                   </div>
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                             vs {fixture.opponent?.name || 'TBD'}
                                        </span>
                                   </div>
                                   <div className="text-lg font-bold">
                                        <span className={fixture.result === 'W' ? 'text-green-600' : fixture.result === 'L' ? 'text-red-600' : 'text-gray-600'}>
                                             {fixture.teamScore}
                                        </span>
                                        <span className="text-gray-400 mx-1">-</span>
                                        <span className={fixture.result === 'L' ? 'text-green-600' : fixture.result === 'W' ? 'text-red-600' : 'text-gray-600'}>
                                             {fixture.opponentScore}
                                        </span>
                                   </div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                   <span>{fixture.competition.name} - {fixture.season.name}</span>
                                   <span>{getResultText(fixture.result)}</span>
                              </div>

                              {fixture.venue && (
                                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <FaMapMarkerAlt size={8} />
                                        <span>{fixture.venue}</span>
                                   </div>
                              )}
                         </div>
                    </Link>
               ))}

               {fixtures.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                         No recent fixtures
                    </div>
               )}
          </div>
     );
};

export default RecentFixtures;
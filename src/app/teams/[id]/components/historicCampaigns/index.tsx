'use client'

import { Card, CardBody, CardHeader, Spinner, Chip, Accordion, AccordionItem } from "@heroui/react";
import { FaTrophy, FaMedal, FaHistory, FaChartLine } from "react-icons/fa";
import { useState, useEffect } from "react";

interface HistoricCampaign {
     id: string;
     competition: { id: string; name: string };
     season: { id: string; name: string };
     year: number;
     record: {
          played: number;
          won: number;
          lost: number;
          drawn: number;
          winPercentage: number;
     };
     frames: {
          for: number;
          against: number;
          difference: number;
     };
     finalPosition: string;
     achievements: string[];
}

interface HistoricData {
     campaigns: HistoricCampaign[];
     groupedByYear: { [year: string]: HistoricCampaign[] };
}

const HistoricCampaigns = ({ teamId }: { teamId: string }) => {
     const [historicData, setHistoricData] = useState<HistoricData | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchHistoricCampaigns = async () => {
               try {
                    const response = await fetch(`/api/teams/${teamId}/campaigns/history`);
                    if (response.ok) {
                         const data = await response.json();
                         setHistoricData(data);
                    }
               } catch (error) {
                    console.error('Error fetching historic campaigns:', error);
               } finally {
                    setLoading(false);
               }
          };

          fetchHistoricCampaigns();
     }, [teamId]);

     const getPositionColor = (position: string) => {
          if (position.includes('1st')) return 'success';
          if (position.includes('2nd')) return 'warning';
          if (position.includes('3rd')) return 'secondary';
          return 'default';
     };

     const getWinRateColor = (percentage: number) => {
          if (percentage >= 70) return 'text-green-600';
          if (percentage >= 50) return 'text-yellow-600';
          return 'text-red-600';
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
               </div>
          );
     }

     if (!historicData || historicData.campaigns.length === 0) {
          return (
               <Card>
                    <CardBody className="text-center py-8">
                         <FaHistory size={48} className="mx-auto text-gray-400 mb-4" />
                         <h3 className="text-lg font-semibold text-gray-600 mb-2">No Historic Campaigns</h3>
                         <p className="text-gray-500">This team has no previous campaign history.</p>
                    </CardBody>
               </Card>
          );
     }

     // Calculate overall historic stats
     const totalCampaigns = historicData.campaigns.length;
     const totalWins = historicData.campaigns.reduce((sum, c) => sum + c.record.won, 0);
     const totalPlayed = historicData.campaigns.reduce((sum, c) => sum + c.record.played, 0);
     const overallWinRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;
     const topFinishes = historicData.campaigns.filter(c => c.finalPosition.includes('1st') || c.finalPosition.includes('2nd')).length;

     const years = Object.keys(historicData.groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

     return (
          <div className="space-y-6">
               {/* Historic Overview */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaTrophy className="text-yellow-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{totalCampaigns}</p>
                              <p className="text-sm text-gray-600">Total Campaigns</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaChartLine className={`mx-auto mb-2 ${getWinRateColor(overallWinRate)}`} size={24} />
                              <p className="text-2xl font-bold">{overallWinRate}%</p>
                              <p className="text-sm text-gray-600">Historic Win Rate</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaMedal className="text-orange-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{topFinishes}</p>
                              <p className="text-sm text-gray-600">Top 2 Finishes</p>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center p-4">
                              <FaHistory className="text-blue-500 mx-auto mb-2" size={24} />
                              <p className="text-2xl font-bold">{years.length}</p>
                              <p className="text-sm text-gray-600">Years Active</p>
                         </CardBody>
                    </Card>
               </div>

               {/* Campaigns by Year */}
               <Card>
                    <CardHeader>
                         <h3 className="text-lg font-semibold">Campaign History</h3>
                    </CardHeader>
                    <CardBody>
                         <Accordion variant="splitted">
                              {years.map((year) => (
                                   <AccordionItem
                                        key={year}
                                        title={
                                             <div className="flex items-center justify-between">
                                                  <span className="font-semibold">{year}</span>
                                                  <span className="text-sm text-gray-500">
                                                       {historicData.groupedByYear[year].length} campaign{historicData.groupedByYear[year].length !== 1 ? 's' : ''}
                                                  </span>
                                             </div>
                                        }
                                   >
                                        <div className="space-y-4">
                                             {historicData.groupedByYear[year].map((campaign) => (
                                                  <div key={campaign.id} className="border rounded-lg p-4 bg-gray-50">
                                                       <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                 <h4 className="font-semibold">{campaign.competition.name}</h4>
                                                                 <p className="text-sm text-gray-600">{campaign.season.name}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                 <Chip 
                                                                      size="sm" 
                                                                      color={getPositionColor(campaign.finalPosition)}
                                                                      variant="solid"
                                                                 >
                                                                      {campaign.finalPosition}
                                                                 </Chip>
                                                                 {campaign.achievements.map((achievement, idx) => (
                                                                      <Chip key={idx} size="sm" color="success" variant="flat">
                                                                           {achievement}
                                                                      </Chip>
                                                                 ))}
                                                            </div>
                                                       </div>
                                                       
                                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                 <p className="text-gray-600 mb-1">Record</p>
                                                                 <p className="font-semibold">
                                                                      {campaign.record.won}W-{campaign.record.lost}L-{campaign.record.drawn}D
                                                                 </p>
                                                                 <p className={`text-sm ${getWinRateColor(campaign.record.winPercentage)}`}>
                                                                      {campaign.record.winPercentage}% win rate
                                                                 </p>
                                                            </div>
                                                            
                                                            <div>
                                                                 <p className="text-gray-600 mb-1">Frames</p>
                                                                 <p className="font-semibold">
                                                                      {campaign.frames.for}-{campaign.frames.against}
                                                                 </p>
                                                                 <p className={`text-sm ${
                                                                      campaign.frames.difference > 0 ? 'text-green-600' : 
                                                                      campaign.frames.difference < 0 ? 'text-red-600' : 'text-gray-600'
                                                                 }`}>
                                                                      {campaign.frames.difference > 0 ? '+' : ''}{campaign.frames.difference} difference
                                                                 </p>
                                                            </div>
                                                            
                                                            <div>
                                                                 <p className="text-gray-600 mb-1">Fixtures</p>
                                                                 <p className="font-semibold">{campaign.record.played} played</p>
                                                                 <p className="text-sm text-gray-500">of season</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </AccordionItem>
                              ))}
                         </Accordion>
                    </CardBody>
               </Card>
          </div>
     );
};

export default HistoricCampaigns;
'use client'

import { Tabs, Tab, Select, SelectItem, Button, Card, CardBody, CardHeader } from "@heroui/react"
import { FaList, FaTrophy, FaUsers, FaChartBar, FaCalendar } from "react-icons/fa6";
import { FaCog } from "react-icons/fa";
import LeagueTable from "../leagueTable";
import FixtureList from "../fixtureList";
import { useState, useEffect } from 'react'
import Link from "next/link";
import { format } from "date-fns";

const CompetitionContainer = ({
     competition,
     isUserAdmin
}: {
     competition: any,
     isUserAdmin: boolean
}) => {
     const [campaigns, setCampaigns] = useState([])
     const [selectedSeasonId, setSelectedSeasonId] = useState<string>('')
     const [loading, setLoading] = useState(false)

     const seasons = competition?.campaigns?.map(campaign => campaign.season) || []
     const uniqueSeasons = seasons.filter((season, index, self) => 
          index === self.findIndex(s => s.id === season.id)
     )

     const fetchCampaigns = async (seasonId?: string) => {
          if (!competition?.id) return
          
          setLoading(true)
          try {
               const url = `/api/competitions/${competition.id}/campaigns${seasonId ? `?seasonId=${seasonId}` : ''}`
               const response = await fetch(url)
               const data = await response.json()
               setCampaigns(data)
          } catch (error) {
               console.error('Error fetching campaigns:', error)
          } finally {
               setLoading(false)
          }
     }

     useEffect(() => {
          if (competition?.campaigns) {
               setCampaigns(competition.campaigns)
               if (uniqueSeasons.length > 0) {
                    setSelectedSeasonId(uniqueSeasons[0].id)
               }
          }
     }, [competition])

     const handleSeasonChange = (seasonId: string) => {
          setSelectedSeasonId(seasonId)
          fetchCampaigns(seasonId)
     }

     return (
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                         <h1 className="text-3xl font-bold mb-2">{competition?.name}</h1>
                         {competition?.description && (
                              <p className="text-gray-600 mb-2">{competition.description}</p>
                         )}
                         <div className="flex gap-4 text-sm text-gray-500">
                              <span>Collection: {competition?.collection || 'Default'}</span>
                              <span>Sort Order: {competition?.sortOrder || 1}</span>
                         </div>
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                         <Select 
                              variant="bordered" 
                              className="w-48" 
                              items={uniqueSeasons} 
                              label="Season" 
                              placeholder="Select season"
                              selectedKeys={selectedSeasonId ? [selectedSeasonId] : []}
                              onSelectionChange={(keys) => {
                                   const selectedKey = Array.from(keys)[0] as string
                                   if (selectedKey) {
                                        handleSeasonChange(selectedKey)
                                   }
                              }}>
                              {(season: any) => <SelectItem key={season.id}>{season.name}</SelectItem>}
                         </Select>
                         {isUserAdmin && (
                              <Button 
                                   as={Link} 
                                   href={`/competitions/${competition.id}/settings`} 
                                   variant="bordered"
                                   size="sm"
                                   startContent={<FaCog size={14}/>}
                              >
                                   Settings
                              </Button>
                         )}
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                         <CardBody className="text-center">
                              <div className="flex items-center justify-center mb-2">
                                   <FaUsers className="text-blue-500 mr-2" size={20} />
                                   <span className="text-sm font-medium">Teams</span>
                              </div>
                              <div className="text-2xl font-bold">{campaigns.length}</div>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center">
                              <div className="flex items-center justify-center mb-2">
                                   <FaCalendar className="text-green-500 mr-2" size={20} />
                                   <span className="text-sm font-medium">Fixtures</span>
                              </div>
                              <div className="text-2xl font-bold">{competition?._count?.fixtures || 0}</div>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center">
                              <div className="flex items-center justify-center mb-2">
                                   <FaTrophy className="text-purple-500 mr-2" size={20} />
                                   <span className="text-sm font-medium">Campaigns</span>
                              </div>
                              <div className="text-2xl font-bold">{competition?._count?.campaigns || 0}</div>
                         </CardBody>
                    </Card>
                    <Card>
                         <CardBody className="text-center">
                              <div className="flex items-center justify-center mb-2">
                                   <FaChartBar className="text-orange-500 mr-2" size={20} />
                                   <span className="text-sm font-medium">Position</span>
                              </div>
                              <div className="text-2xl font-bold">{competition?.sortOrder || 1}</div>
                         </CardBody>
                    </Card>
               </div>

               <Tabs variant="underlined" className="w-full">
                    <Tab key="table" title={
                         <div className="flex items-center gap-2">
                              <FaTrophy size={16} />
                              <span>League Table</span>
                         </div>
                    }>
                         <div className="mt-6">
                              <LeagueTable campaigns={campaigns} loading={loading} />
                         </div>
                    </Tab>
                    <Tab key="fixtures" title={
                         <div className="flex items-center gap-2">
                              <FaList size={16} />
                              <span>Fixtures</span>
                         </div>
                    }>
                         <div className="mt-6">
                              <FixtureList 
                                   competitionId={competition?.id} 
                                   selectedSeasonId={selectedSeasonId} 
                                   isUserAdmin={isUserAdmin} 
                              />
                         </div>
                    </Tab>
                    {competition?.leagueSnapshots && competition.leagueSnapshots.length > 0 && (
                         <Tab key="history" title={
                              <div className="flex items-center gap-2">
                                   <FaChartBar size={16} />
                                   <span>League History</span>
                              </div>
                         }>
                              <div className="mt-6 space-y-4">
                                   <h3 className="text-lg font-semibold">Recent League Snapshots</h3>
                                   <div className="grid gap-2">
                                        {competition.leagueSnapshots.slice(0, 10).map((snapshot: any) => (
                                             <Card key={snapshot.id} className="p-3">
                                                  <div className="flex justify-between items-center">
                                                       <div>
                                                            <span className="font-medium">{snapshot.team.name}</span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                 Position {snapshot.position} | {snapshot.season.name}
                                                            </span>
                                                       </div>
                                                       <div className="text-right text-sm">
                                                            <div>Points: {snapshot.points}</div>
                                                            <div className="text-gray-500">
                                                                 {format(new Date(snapshot.snapshotDate), 'dd MMM yyyy')}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </Card>
                                        ))}
                                   </div>
                              </div>
                         </Tab>
                    )}
               </Tabs>
          </div>
     )
}

export default CompetitionContainer;
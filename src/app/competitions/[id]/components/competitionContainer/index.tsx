'use client'

import { Tabs, Tab, Select, SelectItem, Button } from "@heroui/react"
import { FaList, FaTrophy } from "react-icons/fa6";
import LeagueTable from "../leagueTable";
import FixtureList from "../fixtureList";
import { sendGAEvent  } from '@next/third-parties/google'
import { useState, useEffect } from 'react'

const CompetitionContainer = ({
     competition
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
          <>
               <div className="flex flex-col md:flex-row justify-between">
                    <h1 className="text-xl font-bold">{competition?.name}</h1>
                    <Select 
                         variant="bordered" 
                         className="w-full my-5 md:my-0 md:max-w-3xs" 
                         items={uniqueSeasons} 
                         label="Season" 
                         placeholder="Select season"
                         selectedKeys={selectedSeasonId ? [selectedSeasonId] : []}
                         onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string
                              if (selectedKey) {
                                   handleSeasonChange(selectedKey)
                              }
                         }}
                    >
                         {(season: any) => <SelectItem key={season.id}>{season.name}</SelectItem>}
                    </Select>
               </div>

               <Button onPress={() => {
                    sendGAEvent('event', 'buttonClicked', { value: 'xyz' })
               }}>GA button</Button>

               <div>
                    <Tabs variant={"light"}>
                         <Tab key="photos" title={
                              <div className="flex flex-row items-center">
                                   <FaTrophy size={24} className="pr-2" />
                                   <span>League table</span>
                              </div>
                         }>
                              <LeagueTable campaigns={campaigns} loading={loading} />
                         </Tab>
                         <Tab key="music" title={
                              <div className="flex flex-row items-center">
                                   <FaList size={24} className="pr-2" />
                                   <span>Fixtures</span>
                              </div>
                         }>
                              <FixtureList />
                         </Tab>
                    </Tabs>
               </div>

          </>
     )
}

export default CompetitionContainer;
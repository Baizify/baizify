'use client'

import { Tabs, Tab, Select, SelectItem, Button } from "@heroui/react"
import { FaList, FaTrophy } from "react-icons/fa6";
import LeagueTable from "../leagueTable";
import FixtureList from "../fixtureList";
import { sendGAEvent  } from '@next/third-parties/google'

const CompetitionContainer = ({
     competition
}) => {

     return (
          <>
               <div className="flex flex-col md:flex-row justify-between">
                    <h1 className="text-xl font-bold">{competition?.name}</h1>
                    <Select variant="bordered" className="w-full my-5 md:my-0 md:max-w-3xs" items={[{ id: 1, name: '2025-26' }]} label="Season" placeholder="Select season">
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
                              <LeagueTable />
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
'use client'
import Image from "next/image";
import { Calendar, Card, CardBody, DatePicker } from "@heroui/react"
import { FaShield } from "react-icons/fa6";
import { format } from 'date-fns';

const FixtureList = () => {

     return (
          <div className="md:grid gap-1 grid-cols-12">

               <div className="hidden md:block col-span-4">
                    <Calendar />
               </div>

               <div className="md:hidden mb-5">
                    <DatePicker />
               </div>

               <div className="col-span-8">
                    <Card className="mb-5">
                         <CardBody className="w-full flex flex-row justify-around items-center">
                              <div className="flex flex-col items-center text-center">
                                   <Image src="/HHCC.png" width={24} height={24} alt="HHCC" />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>

                              <div className="hidden lg:block text-2xl font-bold">
                                   0
                              </div>

                              <div className="flex flex-col items-center">
                                   <span className="hidden lg:inline">{format(new Date(), "dd MMMM yyyy")}</span>
                                   <span className="inline lg:hidden">{format(new Date(), "dd.MM.yyyy")}</span>
                                   <span className="flex flex-row w-full justify-around lg:inline lg:text-center">
                                        <span className="lg:hidden font-bold">0</span>
                                        <span>vs</span>
                                        <span className="lg:hidden font-bold">0</span>
                                   </span>
                              </div>
                              
                              <div className="hidden lg:block text-2xl font-bold">
                                   9
                              </div>

                              <div className="flex flex-col items-center text-center">
                                   <FaShield width={24} height={24} />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>
                         </CardBody>
                    </Card>

                    <Card className="mb-5">
                         <CardBody className="w-full flex flex-row justify-around items-center">
                              <div className="flex flex-col items-center text-center">
                                   <Image src="/HHCC.png" width={24} height={24} alt="HHCC" />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>

                              <div className="hidden lg:block text-2xl font-bold">
                                   0
                              </div>

                              <div className="flex flex-col items-center">
                                   <span className="hidden lg:inline">{format(new Date(), "dd MMMM yyyy")}</span>
                                   <span className="inline lg:hidden">{format(new Date(), "dd.MM.yyyy")}</span>
                                   <span className="flex flex-row w-full justify-around lg:inline lg:text-center">
                                        <span className="lg:hidden font-bold">0</span>
                                        <span>vs</span>
                                        <span className="lg:hidden font-bold">0</span>
                                   </span>
                              </div>
                              
                              <div className="hidden lg:block text-2xl font-bold">
                                   9
                              </div>

                              <div className="flex flex-col items-center text-center">
                                   <FaShield width={24} height={24} />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>
                         </CardBody>
                    </Card>

                    <Card className="mb-5">
                         <CardBody className="w-full flex flex-row justify-around items-center">
                              <div className="flex flex-col items-center text-center">
                                   <Image src="/HHCC.png" width={24} height={24} alt="HHCC" />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>

                              <div className="hidden lg:block text-2xl font-bold">
                                   0
                              </div>

                              <div className="flex flex-col items-center">
                                   <span className="hidden lg:inline">{format(new Date(), "dd MMMM yyyy")}</span>
                                   <span className="inline lg:hidden">{format(new Date(), "dd.MM.yyyy")}</span>
                                   <span className="flex flex-row w-full justify-around lg:inline lg:text-center">
                                        <span className="lg:hidden font-bold">0</span>
                                        <span>vs</span>
                                        <span className="lg:hidden font-bold">0</span>
                                   </span>
                              </div>
                              
                              <div className="hidden lg:block text-2xl font-bold">
                                   9
                              </div>

                              <div className="flex flex-col items-center text-center">
                                   <FaShield width={24} height={24} />
                                   <span className="text-xs md:text-medium font-bold mt-3">Hanging Heaton CC (A)</span>
                              </div>
                         </CardBody>
                    </Card>
               </div>
          </div>
     )

}

export default FixtureList;
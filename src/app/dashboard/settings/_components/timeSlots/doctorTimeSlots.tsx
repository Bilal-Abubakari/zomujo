'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { JSX } from 'react';
import CreateTimeSlots from '@/app/dashboard/settings/_components/timeSlots/createTimeSlots';

const DoctorTimeSlots = (): JSX.Element => (
  <Tabs defaultValue="create">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="create">Create Pattern</TabsTrigger>
      <TabsTrigger value="view">View Slots</TabsTrigger>
    </TabsList>
    <TabsContent value="create">
      <CreateTimeSlots />
    </TabsContent>
    <TabsContent value="view">Yet to be implemented</TabsContent>
  </Tabs>
);

export default DoctorTimeSlots;

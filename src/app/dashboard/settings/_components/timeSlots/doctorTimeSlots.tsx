'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { JSX } from 'react';
import CreateTimeSlots from '@/app/dashboard/settings/_components/timeSlots/createTimeSlots';
import ViewTimeSlots from '@/app/dashboard/settings/_components/timeSlots/viewTimeSlots';
import ViewPatterns from '@/app/dashboard/settings/_components/timeSlots/viewPatterns';

const DoctorTimeSlots = (): JSX.Element => (
  <Tabs defaultValue="create">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="create">Create Pattern</TabsTrigger>
      <TabsTrigger value="view-patterns">View Patterns</TabsTrigger>
      <TabsTrigger value="view-slots">View Slots</TabsTrigger>
    </TabsList>
    <TabsContent value="create">
      <CreateTimeSlots />
    </TabsContent>
    <TabsContent value="view-patterns">
      <ViewPatterns />
    </TabsContent>
    <TabsContent value="view-slots">
      <ViewTimeSlots />
    </TabsContent>
  </Tabs>
);

export default DoctorTimeSlots;

'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { JSX } from 'react';
import CreateTimeSlots from '@/app/dashboard/settings/_components/timeSlots/createTimeSlots';
import ViewTimeSlots from '@/app/dashboard/settings/_components/timeSlots/viewTimeSlots';
import ViewPatterns from '@/app/dashboard/settings/_components/timeSlots/viewPatterns';

const DoctorTimeSlots = (): JSX.Element => (
  <Tabs defaultValue="create">
    <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
      <TabsTrigger value="create" className="py-2 whitespace-normal">
        Create Pattern
      </TabsTrigger>
      <TabsTrigger value="view-patterns" className="py-2 whitespace-normal">
        View Patterns
      </TabsTrigger>
      <TabsTrigger value="view-slots" className="py-2 whitespace-normal">
        View Slots
      </TabsTrigger>
    </TabsList>
    <TabsContent className="w-full" value="create">
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

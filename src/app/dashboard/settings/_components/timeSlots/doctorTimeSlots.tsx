'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { JSX, useState } from 'react';
import CreateTimeSlots from '@/app/dashboard/settings/_components/timeSlots/createTimeSlots';
import ViewTimeSlots from '@/app/dashboard/settings/_components/timeSlots/viewTimeSlots';
import ViewPatterns from '@/app/dashboard/settings/_components/timeSlots/viewPatterns';

const DoctorTimeSlots = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState('create');

  const handleSlotCreated = (): void => {
    setActiveTab('view-patterns');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
        <CreateTimeSlots onSlotCreated={handleSlotCreated} />
      </TabsContent>
      <TabsContent value="view-patterns">
        <ViewPatterns />
      </TabsContent>
      <TabsContent value="view-slots">
        <ViewTimeSlots />
      </TabsContent>
    </Tabs>
  );
};

export default DoctorTimeSlots;

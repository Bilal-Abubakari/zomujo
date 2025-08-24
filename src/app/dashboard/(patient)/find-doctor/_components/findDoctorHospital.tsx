'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { JSX, useEffect } from 'react';
import Doctors from './doctors';
import Hospitals from '@/app/dashboard/(patient)/find-doctor/_components/hospitals';
import { Tab, useQueryParam } from '@/hooks/useQueryParam';

const FindDoctorHospital = (): JSX.Element => {
  const { updateQuery, getQueryParam } = useQueryParam();

  useEffect(() => {
    updateQuery('tab', getQueryParam('tab') === Tab.Hospitals ? Tab.Hospitals : Tab.Doctors);
  }, []);

  return (
    <div>
      <section>
        <p className="text-[32px] font-bold">
          {getQueryParam('tab') === Tab.Doctors ? 'Find Doctors' : 'Find Hospitals'}
        </p>
      </section>

      <section className="mt-4">
        <Tabs value={getQueryParam('tab')}>
          <TabsList>
            <TabsTrigger
              value={Tab.Doctors}
              className="rounded-2xl"
              onClick={() => updateQuery('tab', Tab.Doctors)}
            >
              Doctors
            </TabsTrigger>
            <TabsTrigger
              value={Tab.Hospitals}
              className="rounded-2xl"
              onClick={() => updateQuery('tab', Tab.Hospitals)}
            >
              Hospital
            </TabsTrigger>
          </TabsList>

          {getQueryParam('tab') === Tab.Doctors && (
            <TabsContent
              hidden={getQueryParam('tab') !== Tab.Doctors}
              forceMount={true}
              className="mt-2"
              value={Tab.Doctors}
            >
              <Doctors />
            </TabsContent>
          )}
          {getQueryParam('tab') === Tab.Hospitals && (
            <TabsContent
              hidden={getQueryParam('tab') !== Tab.Hospitals}
              forceMount={true}
              className="mt-2"
              value={Tab.Hospitals}
            >
              <Hospitals />
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
};

export default FindDoctorHospital;

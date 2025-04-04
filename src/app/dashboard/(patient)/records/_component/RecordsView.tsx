'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX, useEffect } from 'react';
import { RecordsTab, useQueryParam } from '@/hooks/useQueryParam';
import RecordRequests from '@/app/dashboard/(patient)/records/_component/RecordRequests';

const RecordsView = (): JSX.Element => {
  const { updateQuery, getQueryParam } = useQueryParam();

  useEffect(() => {
    updateQuery(
      'recordsTab',
      getQueryParam('recordsTab') === RecordsTab.MyRecord
        ? RecordsTab.MyRecord
        : RecordsTab.Requests,
    );
  }, []);
  return (
    <div>
      <div>
        <Tabs value={getQueryParam('recordsTab')} className="mt-2">
          <div className="flex items-center">
            <p className="text-xl font-bold">Records</p>
            <div className="m-auto">
              <TabsList>
                <TabsTrigger
                  value={RecordsTab.MyRecord}
                  className="rounded-2xl"
                  onClick={() => updateQuery('recordsTab', RecordsTab.MyRecord)}
                >
                  My Record
                </TabsTrigger>
                <TabsTrigger
                  value={RecordsTab.Requests}
                  className="rounded-2xl"
                  onClick={() => updateQuery('recordsTab', RecordsTab.Requests)}
                >
                  Requests
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          {getQueryParam('recordsTab') === RecordsTab.MyRecord && (
            <TabsContent
              className="mt-6"
              value={RecordsTab.MyRecord}
              forceMount={true}
              hidden={getQueryParam('recordsTab') !== RecordsTab.MyRecord}
            >
              <div>My records yet to be implemented</div>
            </TabsContent>
          )}
          {getQueryParam('recordsTab') === RecordsTab.Requests && (
            <TabsContent
              value={RecordsTab.Requests}
              forceMount={true}
              hidden={getQueryParam('recordsTab') !== RecordsTab.Requests}
              className="mt-6"
            >
              <RecordRequests />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default RecordsView;

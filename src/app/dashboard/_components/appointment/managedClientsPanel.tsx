import React, { JSX } from 'react';
import PatientPanel from '../../(admin)/(user)/_components/patientPanel';

const ManagedClientsPanel = (): JSX.Element => (
  <div className="mt-4 rounded-lg bg-white">
    <div>
      <p className="pt-6 pl-6 text-xl font-bold">Managed clients</p>
      <PatientPanel doctorView={true} />
    </div>
  </div>
);

export default ManagedClientsPanel;

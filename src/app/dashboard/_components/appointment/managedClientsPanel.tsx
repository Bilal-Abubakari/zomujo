import React, { JSX} from 'react';
import PatientPanel from '../../(admin)/(user)/_components/patientPanel';



const ManagedClientsPanel = (): JSX.Element => {
  return (
    <div className="mt-4 rounded-lg bg-white">
      <div>
        <p className="pt-6 text-xl font-bold pl-6">Managed clients</p>
        <PatientPanel doctorView={true} />
      </div>
    </div>
  );
};

export default ManagedClientsPanel;
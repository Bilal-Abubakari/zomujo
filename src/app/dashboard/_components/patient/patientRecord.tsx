import { IPatient } from '@/types/patient.interface';
import { JSX } from 'react';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
// TODO: Telemedicine limitation - vitals measurement not supported yet. PatientVitalsCard disabled until remote vitals integration.
// import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import PatientLifeFamilyCard from '@/app/dashboard/_components/patient/patientLifeFamilyCard';
import PatientPersonal from '@/app/dashboard/_components/patient/patientPersonal';

type PatientRecordProps = {
  patient: IPatient;
};

const PatientRecord = ({ patient }: PatientRecordProps): JSX.Element => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
    <div className="space-y-4">
      <PatientPersonal {...patient} />
      <PatientCard />
    </div>
    <div className="space-y-4">
      {/* TODO: Re-enable <PatientVitalsCard /> when remote vitals collection becomes available */}
      <PatientLifeFamilyCard />
    </div>
  </div>
);

export default PatientRecord;

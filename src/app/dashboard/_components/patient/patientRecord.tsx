import { IPatient } from '@/types/patient.interface';
import { JSX } from 'react';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import PatientLifeFamilyCard from '@/app/dashboard/_components/patient/patientLifeFamilyCard';
import PatientPersonal from '@/app/dashboard/_components/patient/patientPersonal';

type PatientRecordProps = {
  patient: IPatient;
};

const PatientRecord = ({ patient }: PatientRecordProps): JSX.Element => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div className="space-y-4">
      <PatientPersonal {...patient} />
      <PatientCard />
    </div>
    <div>
      <PatientVitalsCard />
    </div>
    <div>
      <PatientLifeFamilyCard />
    </div>
  </div>
);

export default PatientRecord;

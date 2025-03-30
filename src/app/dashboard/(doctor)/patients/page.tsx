import { JSX } from 'react';
import PatientPanel from '@/app/dashboard/(admin)/(user)/_components/patientPanel';

const Patients = (): JSX.Element => <PatientPanel doctorView={true} />;

export default Patients;

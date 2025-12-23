'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/lib/hooks';
import { setUserInfo } from '@/lib/features/auth/authSlice';
import { Role, AcceptDeclineStatus } from '@/types/shared.enum';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';

/**
 * Development Login Page
 * This page allows you to quickly login as different user types for development purposes
 * WITHOUT needing API calls.
 * 
 * ⚠️ FOR DEVELOPMENT ONLY - Remove this page before production!
 */

const DevLogin = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const loginAs = (role: Role) => {
    let mockUser;
    let mockExtra;

    switch (role) {
      case Role.Hospital:
        mockUser = {
          id: 'hospital-dev-001',
          firstName: 'Hospital',
          lastName: 'Admin',
          email: 'admin@devhospital.com',
          role: Role.Hospital,
          status: 'verified' as const,
        };
        mockExtra = {
          id: 'hospital-extra-001',
          name: 'Dev Ridge Hospital',
          location: 'Osu, Accra, Ghana',
          email: 'admin@devhospital.com',
          phone: '+233 24 123 4567',
          lat: 5.5558,
          long: -0.1969,
          gpsLink: 'https://maps.google.com/?q=Osu+Accra',
          orgId: 'hospital-extra-001',
          status: AcceptDeclineStatus.Accepted,
        };
        break;

      case Role.Doctor:
        mockUser = {
          id: 'doctor-dev-001',
          firstName: 'Dr. John',
          lastName: 'Mensah',
          email: 'doctor@devhospital.com',
          role: Role.Doctor,
          status: 'verified' as const,
        };
        mockExtra = {
          id: 'doctor-extra-001',
          orgId: 'hospital-extra-001',
          specialty: 'General Practice',
          MDCRegistration: 'MDC-12345',
          yearsOfExperience: 5,
          bio: 'Experienced general practitioner',
          status: AcceptDeclineStatus.Accepted,
          consultationFee: 100,
        };
        break;

      case Role.Patient:
        mockUser = {
          id: 'patient-dev-001',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'patient@test.com',
          role: Role.Patient,
          status: 'verified' as const,
        };
        mockExtra = {
          id: 'patient-extra-001',
          dob: '1990-01-15',
          gender: 'female',
          phone: '+233 20 987 6543',
        };
        break;

      case Role.Admin:
        mockUser = {
          id: 'admin-dev-001',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@devhospital.com',
          role: Role.Admin,
          status: 'verified' as const,
        };
        mockExtra = {
          id: 'admin-extra-001',
          orgId: 'hospital-extra-001',
          hospitalName: 'Dev Ridge Hospital',
          status: AcceptDeclineStatus.Accepted,
        };
        break;

      default:
        return;
    }

    // Set the mock user in Redux store
    dispatch(setUserInfo({ user: mockUser, extra: mockExtra }));

    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🚀 Development Login
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2">
            Quick login for development - No API needed!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ <strong>FOR DEVELOPMENT ONLY</strong> - Remove this page before production
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <div>
                  <h3 className="font-semibold">Hospital Admin</h3>
                  <p className="text-xs text-gray-500">Manage hospital & appointments</p>
                </div>
              </div>
              <Button
                onClick={() => loginAs(Role.Hospital)}
                className="w-full"
                variant="default"
                child="Login as Hospital"
              />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <h3 className="font-semibold">Doctor</h3>
                  <p className="text-xs text-gray-500">View patients & consultations</p>
                </div>
              </div>
              <Button
                onClick={() => loginAs(Role.Doctor)}
                className="w-full"
                variant="default"
                child="Login as Doctor"
              />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <h3 className="font-semibold">Patient</h3>
                  <p className="text-xs text-gray-500">Book appointments & records</p>
                </div>
              </div>
              <Button
                onClick={() => loginAs(Role.Patient)}
                className="w-full"
                variant="default"
                child="Login as Patient"
              />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="font-semibold">Admin</h3>
                  <p className="text-xs text-gray-500">System administration</p>
                </div>
              </div>
              <Button
                onClick={() => loginAs(Role.Admin)}
                className="w-full"
                variant="default"
                child="Login as Admin"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm mb-2">📝 Mock User Details:</h4>
            <ul className="text-xs space-y-1 text-gray-700">
              <li><strong>Hospital:</strong> Dev Ridge Hospital (Osu, Accra)</li>
              <li><strong>Doctor:</strong> Dr. John Mensah - General Practice</li>
              <li><strong>Patient:</strong> Jane Doe</li>
              <li><strong>Admin:</strong> Admin User</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevLogin;

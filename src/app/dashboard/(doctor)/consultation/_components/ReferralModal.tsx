import React, { JSX, useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/lib/hooks';
import { getAllDoctors } from '@/lib/features/doctors/doctorsThunk';
import { IDoctor } from '@/types/doctor.interface';
import { IReferral } from '@/types/consultation.interface';
import { Search, Check, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { IPagination } from '@/types/shared.interface';

enum ReferralType {
  Internal = 'internal',
  External = 'external',
}
interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (referral: IReferral) => void;
}

export const ReferralModal = ({ open, onClose, onSave }: ReferralModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ReferralType>(ReferralType.Internal);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);

  const [externalDetails, setExternalDetails] = useState({
    doctorName: '',
    facility: '',
    email: '',
    notes: '',
  });

  const searchDoctors = useCallback(
    async (query: string) => {
      setLoadingDoctors(true);
      const result = await dispatch(
        getAllDoctors({ search: query, pageSize: 15, status: AcceptDeclineStatus.Accepted }),
      ).unwrap();
      if (showErrorToast(result)) {
        setLoadingDoctors(false);
        toast(result as Toast);
        return;
      }
      const doctors = (result as IPagination<IDoctor>).rows;
      setDoctors(doctors);
      setLoadingDoctors(false);
    },
    [dispatch],
  );

  useEffect(() => {
    if (activeTab === 'internal') {
      void searchDoctors(debouncedSearch);
    }
  }, [debouncedSearch, activeTab, searchDoctors]);

  const handleSaveInternal = (): void => {
    if (!selectedDoctor) {
      return;
    }
    onSave({
      type: 'internal',
      doctorId: selectedDoctor.id,
      doctor: selectedDoctor,
    });
    onClose();
  };

  const handleSaveExternal = (): void => {
    onSave({
      type: 'external',
      ...externalDetails,
    });
    onClose();
  };

  const getDoctorListContent = (): React.ReactNode => {
    if (loadingDoctors) {
      return (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin" />
        </div>
      );
    }
    if (doctors.length > 0) {
      return doctors.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => setSelectedDoctor(doc)}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
            selectedDoctor?.id === doc.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={doc.profilePicture || ''} />
            <AvatarFallback>
              {doc.firstName?.[0]}
              {doc.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              Dr. {doc.firstName} {doc.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {doc.specializations?.[0] || 'General Practitioner'}
            </p>
            {/* <p className="text-xs text-gray-400">{doc.hospital?.name}</p> */}
          </div>
          {selectedDoctor?.id === doc.id && <Check className="text-primary h-5 w-5" />}
        </button>
      ));
    }
    return <p className="mt-4 text-center text-sm text-gray-500">No doctors found.</p>;
  };

  const doctorListContent = getDoctorListContent();

  return (
    <Modal
      open={open}
      setState={(isOpen) => !isOpen && onClose()}
      showClose={true}
      content={
        <div className="flex h-125 flex-col">
          <h2 className="mb-4 text-xl font-bold">Refer Patient</h2>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ReferralType)}
            className="flex h-full w-full flex-col"
          >
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="internal">Platform Doctor</TabsTrigger>
              <TabsTrigger value="external">External Doctor</TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="flex min-h-0 flex-1 flex-col">
              <div className="relative mb-4">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, specialty..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-2">{doctorListContent}</div>

              <div className="mt-4 border-t pt-4">
                <Button
                  className="w-full"
                  disabled={!selectedDoctor}
                  onClick={handleSaveInternal}
                  child="Select & Refer"
                />
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              <div className="space-y-3">
                <Input
                  labelName="Doctor's Name"
                  placeholder="e.g. Dr. John medical"
                  value={externalDetails.doctorName}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, doctorName: e.target.value }))
                  }
                />
                <Input
                  labelName="Hospital / Facility"
                  placeholder="e.g. City General Hospital"
                  value={externalDetails.facility}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, facility: e.target.value }))
                  }
                />
                <Input
                  labelName="Email (Optional)"
                  placeholder="For sending referral letter digitally"
                  type="email"
                  value={externalDetails.email}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Short note or reason for referral..."
                  value={externalDetails.notes}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="min-h-25"
                />
              </div>
              <div className="mt-auto pt-4">
                <Button
                  className="w-full"
                  disabled={!externalDetails.doctorName || !externalDetails.facility}
                  onClick={handleSaveExternal}
                  child="Generate Referral"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      }
    />
  );
};

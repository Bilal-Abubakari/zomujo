import React, { JSX, useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/lib/hooks';
import { getAllDoctors } from '@/lib/features/doctors/doctorsThunk';
import { referPatient } from '@/lib/features/appointments/consultation/consultationThunk';
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
  patientId?: string;
}

export const ReferralModal = ({
  open,
  onClose,
  onSave,
  patientId,
}: ReferralModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ReferralType>(ReferralType.Internal);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [internalLetter, setInternalLetter] = useState('');

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

  const handleSaveInternal = async (): Promise<void> => {
    if (!selectedDoctor || !patientId) {
      if (!patientId) {
        toast({
          title: 'Error',
          description: 'Patient identifier is missing.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsSubmitting(true);
    const result = await dispatch(
      referPatient({
        patientId,
        referredDoctorId: selectedDoctor.id,
        letter: internalLetter,
      }),
    ).unwrap();

    if (showErrorToast(result)) {
      toast(result as Toast);
      setIsSubmitting(false);
      return;
    }

    toast(result as Toast);
    onSave({
      type: 'internal',
      doctorId: selectedDoctor.id,
      doctor: selectedDoctor,
      notes: internalLetter,
    });
    setIsSubmitting(false);
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
        <div className="flex justify-center p-8">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (doctors.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-3 pt-1 pb-2 pl-1 md:grid-cols-2">
          {doctors.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDoctor(doc)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                selectedDoctor?.id === doc.id
                  ? 'border-primary ring-primary bg-primary/5 ring-1'
                  : 'hover:border-primary/50 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Avatar className="h-12 w-12 shrink-0 border border-slate-100">
                <AvatarImage src={doc.profilePicture || ''} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {doc.firstName?.[0]}
                  {doc.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Dr. {doc.firstName} {doc.lastName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {doc.specializations?.[0] || 'General Practitioner'}
                </p>
              </div>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  selectedDoctor?.id === doc.id
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-300'
                }`}
              >
                {selectedDoctor?.id === doc.id && <Check className="h-3 w-3 stroke-3" />}
              </div>
            </button>
          ))}
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
        <p className="text-sm text-slate-500">No doctors found matching your search.</p>
      </div>
    );
  };

  const doctorListContent = getDoctorListContent();

  return (
    <Modal
      open={open}
      setState={(isOpen) => !isOpen && onClose()}
      showClose={true}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
      content={
        <div className="px-1">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Refer Patient</h2>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReferralType)}>
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
              <TabsTrigger
                value="internal"
                className="rounded-md py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Platform Doctor
              </TabsTrigger>
              <TabsTrigger
                value="external"
                className="rounded-md py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                External Doctor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="mt-0 space-y-6">
              <div className="group relative">
                <Search className="group-focus-within:text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
                <Input
                  placeholder="Search by name, specialty..."
                  className="h-11 border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="-mr-1 max-h-[45vh] overflow-y-auto pr-1">{doctorListContent}</div>

              {selectedDoctor && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3 border-t border-slate-100 pt-2 duration-300">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Referral Letter / Notes
                    </label>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                      Internal
                    </span>
                  </div>
                  <Textarea
                    placeholder="Short note or reason for referral..."
                    value={internalLetter}
                    onChange={(e) => setInternalLetter(e.target.value)}
                    className="min-h-32 resize-none border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              <div className="mt-4 pb-4">
                <Button
                  className="h-12 w-full text-base font-semibold"
                  disabled={!selectedDoctor || isSubmitting}
                  onClick={handleSaveInternal}
                  isLoading={isSubmitting}
                  child="Select & Refer"
                />
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              <div className="w-full space-y-3">
                <Input
                  labelName="Doctor's Name"
                  placeholder="e.g. Dr. John medical"
                  value={externalDetails.doctorName}
                  defaultMaxWidth={false}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, doctorName: e.target.value }))
                  }
                />
                <Input
                  labelName="Hospital / Facility"
                  placeholder="e.g. City General Hospital"
                  value={externalDetails.facility}
                  defaultMaxWidth={false}
                  onChange={(e) =>
                    setExternalDetails((prev) => ({ ...prev, facility: e.target.value }))
                  }
                />
                <Input
                  labelName="Email (Optional)"
                  placeholder="For sending referral letter digitally"
                  type="email"
                  className="max-w-full"
                  value={externalDetails.email}
                  defaultMaxWidth={false}
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

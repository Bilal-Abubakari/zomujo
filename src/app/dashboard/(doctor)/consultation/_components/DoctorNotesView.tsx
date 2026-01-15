import React, { JSX, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { updateNotes } from '@/lib/features/appointments/consultation/consultationThunk';
import { useAppDispatch } from '@/lib/hooks';
import { toast } from '@/hooks/use-toast';

interface DoctorNotesViewProps {
  doctorNotes: string;
  onNotesChange: (notes: string) => void;
  onResetNotes: () => void;
  appointmentId: string;
}

export const DoctorNotesView = ({
  doctorNotes,
  onNotesChange,
  onResetNotes,
  appointmentId,
}: DoctorNotesViewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleSaveNotes = async (): Promise<void> => {
    setIsLoading(true);
    const response = await dispatch(updateNotes({ appointmentId, notes: doctorNotes })).unwrap();
    toast(response);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="text-primary h-5 w-5" />
          Doctor&apos;s Consultation Notes
        </CardTitle>
        <p className="mt-2 text-sm text-gray-600">
          Edit and customize the consultation notes as needed. These notes are automatically
          generated from the consultation data.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea
          value={doctorNotes}
          onChange={({ target }) => onNotesChange(target.value)}
          className="min-h-150 font-mono text-sm"
          placeholder="Consultation notes will appear here..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            disabled={isLoading}
            variant="outline"
            onClick={onResetNotes}
            child={<span>Reset to Default</span>}
          />
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            variant="default"
            onClick={handleSaveNotes}
            child={<span>Save Notes</span>}
          />
        </div>
      </CardContent>
    </Card>
  );
};

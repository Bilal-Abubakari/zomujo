import SignaturePad from 'react-signature-pad-wrapper';
import { JSX, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { uploadSignature } from '@/lib/features/doctors/doctorsThunk';
import { blobToFile, dataURLtoBlob, showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';

type SignatureProps = {
  signatureAdded: () => void;
  hasExistingSignature?: boolean;
};
const Signature = ({
  signatureAdded,
  hasExistingSignature = false,
}: SignatureProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const signatureRef = useRef<SignaturePad>(null);
  const [savingSignature, setSavingSignature] = useState(false);

  const uploadSignatureHandler = async (): Promise<void> => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      console.error('Signature pad is empty or not initialized.');
      return;
    }
    setSavingSignature(true);
    const signatureData = signatureRef.current.toDataURL('image/png');
    const blob = dataURLtoBlob(signatureData);
    const file = blobToFile(blob, 'signature.png');
    const { payload } = await dispatch(uploadSignature(file));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setSavingSignature(false);
      return;
    }
    toast({
      title: hasExistingSignature ? 'Signature Updated' : 'Signature Added',
      description: hasExistingSignature
        ? 'Your signature has been successfully updated.'
        : 'Your signature has been successfully added.',
      variant: 'success',
    });
    setSavingSignature(false);
    signatureAdded();
  };

  return (
    <div>
      <span className="font-bold">{hasExistingSignature ? 'Edit Signature' : 'Add Signature'}</span>
      <p className="text-sm text-gray-500">
        {hasExistingSignature
          ? 'Update your signature by signing below. This will replace your current signature.'
          : 'We did not find any signature in your records, please add your signature by signing below.'}
      </p>
      <SignaturePad width={500} height={500} ref={signatureRef} />
      <div className="space-x-2">
        <Button
          disabled={savingSignature}
          isLoading={savingSignature}
          child={'Save'}
          onClick={uploadSignatureHandler}
        />
        <Button
          disabled={savingSignature}
          variant="destructive"
          child="Clear"
          onClick={() => signatureRef.current?.clear()}
        />
      </div>
    </div>
  );
};

export default Signature;

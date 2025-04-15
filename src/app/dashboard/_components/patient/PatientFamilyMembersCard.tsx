import React, { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
import { AvatarComp } from '@/components/ui/avatar';
import { useAppSelector } from '@/lib/hooks';
import { selectFamilyMembers } from '@/lib/features/patients/patientsSelector';

const PatientFamilyMembersCard = (): JSX.Element => {
  const familyMembers = useAppSelector(selectFamilyMembers);
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Family Members</p>
        <Button
          variant="outline"
          child={
            <>
              <FilePenLine />
              Add
            </>
          }
        />
      </div>
      <hr className="my-4" />
      {familyMembers?.length === 0 ? (
        <div className="flex h-40 items-center justify-center">No family members found</div>
      ) : (
        <div className="max-h-[360px] space-y-4 overflow-y-scroll">
          {familyMembers?.map(
            ({ lastName, firstName, phoneNumber, relation, image, email }, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-xl bg-gradient-to-b from-[#E0EEFF] to-[#F2F9FF] p-4"
              >
                <AvatarComp
                  name={`${firstName} ${lastName}`}
                  imageSrc={image}
                  imageAlt={`${firstName} ${lastName}`}
                />
                <div>
                  <h4 className="font-semibold">
                    {firstName} {lastName}
                  </h4>
                  <p className="text-sm">{relation}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                  <p className="text-xs text-gray-500">{phoneNumber}</p>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};
export default PatientFamilyMembersCard;

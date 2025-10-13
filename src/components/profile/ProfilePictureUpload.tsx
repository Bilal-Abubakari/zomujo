'use client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX } from 'react';
interface ProfilePictureUploadProps {
  userProfilePicture: string | null;
  imageRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
}
const ProfilePictureUpload = ({
  userProfilePicture,
  imageRef,
  handleImageChange,
  resetImage,
}: ProfilePictureUploadProps): JSX.Element => {
  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold">Personal Details</h2>
        <p className="text-gray-500">Update your profile</p>
      </div>
      <hr className="my-7 gap-4" />
      <p className="my-4 font-medium">Upload profile</p>
      <div className="flex items-center justify-start gap-2">
        <div>
          {userProfilePicture ? (
            <Image
              className="h-[79px] w-[79px] rounded-full bg-gray-600 object-fill"
              src={userProfilePicture}
              alt="Profile Picture"
              width={79}
              height={79}
            />
          ) : (
            <div className="flex h-[79px] w-[79px] items-center justify-center rounded-full bg-gray-200">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <input
            className="hidden"
            ref={imageRef as React.RefObject<HTMLInputElement>}
            type="file"
            onChange={handleImageChange}
          />
        </div>
        <Button
          child={'Upload new profile'}
          variant={'outline'}
          className="bg-transparent"
          onClick={() => imageRef.current?.click()}
        />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <Trash2 size={16} onClick={resetImage} />
        </div>
      </div>
    </section>
  );
};
export default ProfilePictureUpload;

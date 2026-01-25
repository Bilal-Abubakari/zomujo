'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { updateDoctorProfile } from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch } from '@/lib/hooks';
import { NotificationInfo } from '@/types/doctor.interface';
import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';

const NotificationPreference = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const { watch, setValue, handleSubmit } = useForm<NotificationInfo>({
    defaultValues: {
      notifications: {
        email: true,
        appointments: true,
        messages: true,
        fileRecordRequest: true,
      },
    },
  });

  async function onSubmit(notification: NotificationInfo): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updateDoctorProfile(notification));
    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">Notification</h2>
        <p className="text-gray-500">
          Stay in the loop! Receive updates, and important news directly to your inbox.
        </p>
        <hr className="my-7 gap-4" />
      </div>
      <div className="flex flex-col gap-2 sm:gap-22.25 md:flex-row">
        <div className="max-w-64.5">
          <p className="font-medium">Email Notification</p>
          <p className="text-sm text-gray-500">
            Manage your preferences anytime to tailor your email experience.
          </p>
        </div>
        <form className="max-w-80.25" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-start gap-2">
            <Switch
              label="On"
              name="on"
              labelClassName="text-base font-medium"
              checked={watch('notifications.email')}
              onCheckedChange={(checked) => setValue('notifications.email', checked)}
            />
          </div>

          <div className="mt-8 flex flex-col justify-start gap-10.5">
            <Checkbox
              name="confirm"
              labelClassName="text-gray-500 font-normal"
              labelName="Stay informed about your appointments hassle-free"
              title="Appointments"
              titleLabelClassName="font-medium -mt-1"
              containerClassName="items-start"
              checked={watch('notifications.appointments')}
              onCheckedChange={(checked) => setValue('notifications.appointments', !!checked)}
            />
            {/*TODO: Not planned for MVP*/}
            {/*<Checkbox*/}
            {/*  name="confirm"*/}
            {/*  labelClassName="text-gray-500 font-normal"*/}
            {/*  labelName="Receive updates, communicate with ease, and stay informed"*/}
            {/*  title="Messages"*/}
            {/*  titleLabelClassName="font-medium -mt-1"*/}
            {/*  containerClassName="items-start"*/}
            {/*  checked={watch('notifications.messages')}*/}
            {/*  onCheckedChange={(checked) => setValue('notifications.messages', !!checked)}*/}
            {/*/>*/}
            <Checkbox
              name="confirm"
              labelClassName="text-gray-500 font-normal"
              labelName="Receive notifications whenever your doctors send record requests"
              title="File record requests"
              titleLabelClassName="font-medium -mt-1"
              containerClassName="items-start"
              checked={watch('notifications.fileRecordRequest')}
              onCheckedChange={(checked) => setValue('notifications.fileRecordRequest', !!checked)}
            />
            <Button
              type="submit"
              child="Save Changes"
              className="mt-12 ml-auto flex"
              isLoading={isLoading}
            />
          </div>
        </form>
      </div>
      <hr className="my-7 gap-4" />
    </div>
  );
};

export default NotificationPreference;

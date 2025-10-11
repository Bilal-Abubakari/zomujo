'use client';

import { Trash } from 'lucide-react';
import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

const defaultMaxSize = 5 * 1024 * 1024; // 5MB
const variants = {
  base: 'c-border-dashed flex h-[280px] w-[300px] flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white p-1.5',
  image: '',
  active: '',
  disabled: '',
  accept: '',
  reject: '',
};

type InputProps = {
  width?: number;
  height?: number;
  className?: string;
  value?: File | string;
  label?: string;
  onChange?: (file?: File) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
  showDeleteIcon?: boolean;
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number): string {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType(): string {
    return 'Invalid file type.';
  },
  tooManyFiles(maxFiles: number): string {
    return `You can only add ${maxFiles} file(s).`;
  },
  fileNotSupported(): string {
    return 'The file is not supported.';
  },
};

const SingleImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      dropzoneOptions = {
        maxFiles: 1,
        maxSize: defaultMaxSize,
        accept: {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
        },
      },
      width,
      height,
      value,
      label = 'Picture',
      className,
      disabled,
      onChange,
      showDeleteIcon = true,
      ...props
    },
    ref,
  ) => {
    const imageUrl = React.useMemo(() => {
      if (typeof value === 'string') {
        return value;
      } else if (value) {
        return URL.createObjectURL(value);
      }
      return null;
    }, [value]);

    const {
      getRootProps,
      getInputProps,
      acceptedFiles,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      accept: { 'image/*': [] },
      multiple: false,
      disabled,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          void onChange?.(file);
        }
      },
      ...dropzoneOptions,
    });

    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          imageUrl && variants.image,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [isFocused, imageUrl, fileRejections, isDragAccept, isDragReject, disabled, className],
    );

    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];
        if (errors[0]?.code === 'file-too-large') {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === 'file-invalid-type') {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === 'too-many-files') {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
        }
        return ERROR_MESSAGES.fileNotSupported();
      }
      return undefined;
    }, [fileRejections, dropzoneOptions]);

    return (
      <div className="relative cursor-pointer">
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height,
            },
          })}
        >
          <input ref={ref} {...getInputProps()} {...props} />

          {imageUrl ? (
            <Image
              className="h-full w-full rounded-xl object-contain"
              src={imageUrl}
              width={width}
              height={height}
              alt={acceptedFiles[0]?.name ?? label}
            />
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-center text-lg font-bold">
                Upload {label} or <span className="text-primary-dark cursor-pointer">Browse</span>
              </p>
              <p className="leading-4 text-gray-500">Supports PNG, JPG, JPEG</p>
            </div>
          )}
          {imageUrl && !disabled && showDeleteIcon && (
            <div
              className="group absolute top-5 right-5 z-50 translate-x-1/4 -translate-y-1/4 transform"
              onClick={(e) => {
                e.stopPropagation();
                void onChange?.(undefined);
              }}
            >
              <Trash className="text-red-500 dark:text-gray-400" width={16} height={16} />
            </div>
          )}
        </div>
        <div className="mt-1 text-xs text-red-500">{errorMessage}</div>
      </div>
    );
  },
);
SingleImageDropzone.displayName = 'SingleImageDropzone';

function formatFileSize(bytes?: number): string {
  if (!bytes) {
    return '0 Bytes';
  }
  bytes = Number(bytes);
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default SingleImageDropzone;

'use client';

import { Trash, Camera, Upload, X, RotateCcw, Check } from 'lucide-react';
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
  enableCamera?: boolean;
  cameraLabel?: string;
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
  cameraPermissionDenied(): string {
    return 'Camera permission denied. Please allow camera access or browse files instead.';
  },
  cameraNotAvailable(): string {
    return 'Camera is not available on this device. Please browse files instead.';
  },
  cameraError(): string {
    return 'Failed to access camera. Please try again or browse files instead.';
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
      enableCamera = false,
      cameraLabel = 'Take Photo',
      ...props
    },
    ref,
  ) => {
    const [isCameraOpen, setIsCameraOpen] = React.useState(false);
    const [cameraError, setCameraError] = React.useState<string | null>(null);
    const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null);
    const [isCameraSupported, setIsCameraSupported] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    React.useEffect(() => {
      if (
        enableCamera &&
        typeof navigator !== 'undefined' &&
        'mediaDevices' in navigator &&
        'getUserMedia' in navigator.mediaDevices
      ) {
        setIsCameraSupported(true);
      }
    }, [enableCamera]);

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
      if (cameraError) {
        return cameraError;
      }
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
    }, [fileRejections, dropzoneOptions, cameraError]);

    const startCamera = React.useCallback(async () => {
      setCameraError(null);
      setIsCameraOpen(true);
      setCapturedPhoto(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Camera error:', error);

        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setCameraError(ERROR_MESSAGES.cameraPermissionDenied());
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            setCameraError(ERROR_MESSAGES.cameraNotAvailable());
          } else {
            setCameraError(ERROR_MESSAGES.cameraError());
          }
        } else {
          setCameraError(ERROR_MESSAGES.cameraError());
        }

        setIsCameraOpen(false);
      }
    }, []);

    const stopCamera = React.useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }, []);

    const capturePhoto = React.useCallback(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedPhoto(imageDataUrl);
          stopCamera();
        }
      }
    }, [stopCamera]);

    const confirmPhoto = React.useCallback(() => {
      if (capturedPhoto) {
        // Convert data URL to File
        fetch(capturedPhoto)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            void onChange?.(file);
            setIsCameraOpen(false);
            setCapturedPhoto(null);
            setCameraError(null);
          })
          .catch((error) => {
            console.error('Error converting photo:', error);
            setCameraError('Failed to process photo. Please try again.');
          });
      }
    }, [capturedPhoto, onChange]);

    const retakePhoto = React.useCallback(() => {
      setCapturedPhoto(null);
      void startCamera();
    }, [startCamera]);

    const closeCamera = React.useCallback(() => {
      stopCamera();
      setIsCameraOpen(false);
      setCapturedPhoto(null);
      setCameraError(null);
    }, [stopCamera]);

    // Cleanup on unmount
    React.useEffect(
      () => (): void => {
        stopCamera();
      },
      [stopCamera],
    );

    return (
      <>
        <div className="relative">
          {!imageUrl && (
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

              <div className="flex flex-col items-center justify-center gap-4 px-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-center text-lg font-bold">
                    Drag & drop or <span className="text-primary-dark cursor-pointer">Browse</span>
                  </p>
                  <p className="mt-1 text-sm leading-4 text-gray-500">Supports PNG, JPG, JPEG</p>
                </div>

                {/* Camera button */}
                {enableCamera && isCameraSupported && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                )}
              </div>
            </div>
          )}

          {imageUrl && (
            <div
              className={dropZoneClassName}
              style={{
                width,
                height,
              }}
            >
              <Image
                className="h-full w-full rounded-xl object-contain"
                src={imageUrl}
                width={width}
                height={height}
                alt={acceptedFiles[0]?.name ?? label}
              />
              {!disabled && showDeleteIcon && (
                <div
                  className="group absolute top-5 right-5 z-50 translate-x-1/4 -translate-y-1/4 transform pb-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onChange?.(undefined);
                  }}
                >
                  <Trash className="text-red-500 dark:text-gray-400" width={16} height={16} />
                </div>
              )}
            </div>
          )}
          {enableCamera && isCameraSupported && !imageUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void startCamera();
              }}
              disabled={disabled}
              className="focus:ring-primary-dark mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-5 w-5" />
              <span>{cameraLabel}</span>
            </button>
          )}

          {errorMessage && <div className="mt-2 text-xs text-red-500">{errorMessage}</div>}
        </div>

        {isCameraOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
              <button
                type="button"
                onClick={closeCamera}
                className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
                aria-label="Close camera"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="relative min-h-100 w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl">
                {!capturedPhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="min-h-100 w-full object-cover"
                    />
                    <div className="absolute right-0 bottom-0 left-0 flex justify-center bg-linear-to-t from-black/60 to-transparent p-6">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="rounded-full bg-white p-4 shadow-xl transition-transform hover:scale-105 focus:ring-4 focus:ring-white/50 focus:outline-none"
                        aria-label="Capture photo"
                      >
                        <Camera className="h-8 w-8 text-gray-900" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative min-h-100 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={capturedPhoto}
                        alt="Captured"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 flex justify-center gap-4 bg-linear-to-t from-black/60 to-transparent p-6">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="flex items-center gap-2 rounded-full bg-gray-700 px-6 py-3 font-medium text-white shadow-xl transition-all hover:bg-gray-600 focus:ring-4 focus:ring-gray-500/50 focus:outline-none"
                      >
                        <RotateCcw className="h-5 w-5" />
                        <span>Retake</span>
                      </button>
                      <button
                        type="button"
                        onClick={confirmPhoto}
                        className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-medium text-white shadow-xl transition-all hover:bg-green-500 focus:ring-4 focus:ring-green-500/50 focus:outline-none"
                      >
                        <Check className="h-5 w-5" />
                        <span>Confirm</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}
      </>
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

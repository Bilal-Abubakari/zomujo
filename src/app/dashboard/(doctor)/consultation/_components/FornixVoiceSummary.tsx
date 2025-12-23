'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { generateVoiceSummary } from '@/lib/features/ai/aiThunk';
import { saveConsultationSummary } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Square, Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';

const FornixVoiceSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const appointmentId = String(params.appointmentId || '');
  const voiceSummary = useAppSelector((s) => s.ai.voiceSummary?.summary);
  const isGenerating = useAppSelector((s) => s.ai.isGenerating);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(
    () => (): void => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    },
    [],
  );

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const localChunks: Blob[] = [];
      recorder.ondataavailable = (e): void => {
        if (e.data.size > 0) {
          localChunks.push(e.data);
        }
      };
      recorder.onstop = (): void => {
        setChunks(localChunks);
        const blob = new Blob(localChunks, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      toast({ title: 'Error', description: 'Microphone access denied', variant: 'destructive' });
    }
  };

  const stopRecording = (): void => {
    mediaRecorder?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const generateSummary = async (): Promise<void> => {
    if (chunks.length === 0) {
      return;
    }
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    const file = new File([audioBlob], 'voice-summary.webm', { type: 'audio/webm' });
    const response = await dispatch(generateVoiceSummary(file));
    if (showErrorToast(response.payload)) {
      toast(response.payload as Toast);
    } else {
      toast({ title: 'Fornix AI', description: 'Summary generated successfully.' });
    }
  };

  const saveSummary = async (): Promise<void> => {
    if (!voiceSummary) {
      return;
    }
    setIsSaving(true);
    const payload = await dispatch(
      saveConsultationSummary({ appointmentId, summary: voiceSummary }),
    ).unwrap();
    setIsSaving(false);
    if (showErrorToast(payload)) {
      toast(payload as Toast);
    } else {
      toast({ title: 'Saved', description: 'Consultation summary saved.' });
    }
  };

  return (
    <div className="border-primary/20 bg-primary-light/10 mt-8 rounded-xl border p-5">
      <div className="flex items-start gap-4">
        <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-white shadow">
          <Sparkles />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Meet Fornix AI</h3>
          <p className="mt-1 text-sm text-gray-600">
            Fornix AI is your AI assistant that helps you document consultations faster. Record
            yourself describing the patient&#39;s complaints and symptoms based on what you
            observed, and Fornix AI will generate a structured consultation summary. Review the
            draft and save if accurate.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <Button
                type="button"
                onClick={startRecording}
                variant="secondary"
                child={
                  <span className="flex items-center">
                    <Mic className="mr-2" size={18} /> Start Recording
                  </span>
                }
              />
            ) : (
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                child={
                  <span className="flex items-center">
                    <Square className="mr-2" size={18} /> Stop
                  </span>
                }
              />
            )}
            <Button
              type="button"
              disabled={chunks.length === 0 || isGenerating}
              onClick={generateSummary}
              child={
                isGenerating ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 animate-spin" size={18} /> Generating...
                  </span>
                ) : (
                  'Generate Summary'
                )
              }
            />
            <Button
              type="button"
              disabled={!voiceSummary || isSaving}
              onClick={saveSummary}
              variant="outline"
              child={
                isSaving ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 animate-spin" size={18} /> Saving...
                  </span>
                ) : (
                  'Save Summary'
                )
              }
            />
          </div>
          {audioURL && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Recorded audio preview</p>
              <audio controls src={audioURL} className="mt-1 w-full" />
            </div>
          )}
          {voiceSummary && (
            <div className="mt-6 rounded-md border bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold">Fornix AI&#39;s Draft Summary</h4>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {voiceSummary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FornixVoiceSummary;

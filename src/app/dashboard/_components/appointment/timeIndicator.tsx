'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, useMemo, useRef, JSX } from 'react';

const formatTime = (hour: number, minute: number): string => {
  const formattedHour = hour > 12 ? hour - 12 : hour;
  const formattedMinute = minute < 10 ? `0${minute}` : minute;
  return `${formattedHour}:${formattedMinute}`;
};

const TimeIndicator = (): JSX.Element => {
  const [time, setTime] = useState(new Date());

  const totalHours = useMemo(() => (time.getHours() * 60 + time.getMinutes()) / 60, [time]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return (): void => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [indicatorRef]);
  return (
    <div
      ref={indicatorRef}
      style={{
        top: 40 + totalHours * 60,
        left: 40,
        width: 40 + 260 * 7,
      }}
      className={cn('bg-primary absolute z-10 h-0.5')}
    >
      <div className="bg-primary absolute top-1/2 -left-5 z-50 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-xs text-white">
        {formatTime(time.getHours(), time.getMinutes())}
      </div>
    </div>
  );
};

export default React.memo(TimeIndicator);

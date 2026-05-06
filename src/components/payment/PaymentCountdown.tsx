'use client';

import { JSX, useEffect, useState } from 'react';

type PaymentCountdownProps = {
  expiresAt: string;
  onExpire?: () => void;
};

const PaymentCountdown = ({ expiresAt, onExpire }: PaymentCountdownProps): JSX.Element => {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          onExpire?.();
        }
        return next;
      });
    }, 1000);

    return (): void => clearInterval(id);
  }, [expiresAt, onExpire]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <span aria-live="polite" className="font-mono font-semibold tabular-nums">
      {mm}:{ss}
    </span>
  );
};

export default PaymentCountdown;

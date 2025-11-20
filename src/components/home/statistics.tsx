import React, { JSX, useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  isVisible: boolean;
}

const CountUp = ({ end, suffix = '', duration = 2000, isVisible }: CountUpProps): JSX.Element => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    const startTime = Date.now();
    const startValue = 0;

    const animate = (): void => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  const formatNumber = (num: number): string => num.toLocaleString('en-US');

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

interface CountUp24_7Props {
  duration?: number;
  isVisible: boolean;
}

const CountUp24_7 = ({ duration = 2000, isVisible }: CountUp24_7Props): JSX.Element => {
  const [firstCount, setFirstCount] = useState(0);
  const [secondCount, setSecondCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    const startTime = Date.now();
    const firstEnd = 24;
    const secondEnd = 7;

    const animate = (): void => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      // Animate first number to 24
      const currentFirstCount = Math.floor(0 + (firstEnd - 0) * easeOutQuart);
      setFirstCount(currentFirstCount);

      // Animate second number to 7 (slightly delayed or together)
      const currentSecondCount = Math.floor(0 + (secondEnd - 0) * easeOutQuart);
      setSecondCount(currentSecondCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setFirstCount(firstEnd);
        setSecondCount(secondEnd);
      }
    };

    requestAnimationFrame(animate);
  }, [duration, isVisible]);

  return (
    <span>
      {firstCount}/{secondCount}
    </span>
  );
};

const Statistics = (): JSX.Element => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="bg-white py-16 pt-40">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold">
            Empowering the Future
            <br />
            of Healthcare in Africa
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Connecting you directly to the care you need, powered by a platform that puts patients
            and doctors in control.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="text-primary mb-2 text-5xl font-bold">
              <CountUp24_7 duration={2000} isVisible={inView} />
            </div>
            <p className="text-muted-foreground">
              Access healthcare specialists
              <br />
              anytime, anywhere
            </p>
          </div>
          <div className="text-center">
            <div className="text-primary mb-2 text-5xl font-bold">
              <CountUp end={1000} suffix="+" duration={2000} isVisible={inView} />
            </div>
            <p className="text-muted-foreground">Empowered Clients</p>
          </div>
          <div className="text-center">
            <div className="text-primary mb-2 text-5xl font-bold">
              <CountUp end={150} duration={2000} isVisible={inView} />
            </div>
            <p className="text-muted-foreground">Expert Collaborations</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;

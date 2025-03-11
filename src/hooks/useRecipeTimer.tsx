
import { useState, useEffect } from 'react';

export function useRecipeTimer() {
  const [activeTimers, setActiveTimers] = useState<{
    step: number;
    duration: number;
    description: string;
    timeLeft: number;
  }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prevTimers => {
        if (prevTimers.length === 0) return prevTimers;

        const updatedTimers = prevTimers.map(timer => ({
          ...timer,
          timeLeft: Math.max(0, timer.timeLeft - 1)
        }));

        return updatedTimers.filter(timer => timer.timeLeft > 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = (step: number, duration: number, description: string) => {
    setActiveTimers(prev => [...prev, { step, duration, description, timeLeft: duration * 60 }]);
  };

  const stopTimer = (step: number) => {
    setActiveTimers(prev => prev.filter(timer => timer.step !== step));
  };

  const clearAllTimers = () => {
    setActiveTimers([]);
  };

  return {
    activeTimers,
    startTimer,
    stopTimer,
    clearAllTimers
  };
}

// src/hooks/useCredits.ts
import { useState, useEffect } from 'react';

export const useCredits = () => {
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('userCredits');
    return saved ? parseInt(saved) : 0;
  });

  const [appliedCredits, setAppliedCredits] = useState(0);

  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setCredits(parseInt(savedCredits));
    }
  }, []);

  const applyCreditsToCart = (cartTotal: number, amount: number): number => {
    const maxApplicable = Math.min(credits, cartTotal);
    const applied = amount > maxApplicable ? maxApplicable : amount;
    setAppliedCredits(applied);
    return applied;
  };

  const getFinalTotal = (cartTotal: number): number => {
    return Math.max(0, cartTotal - appliedCredits);
  };

  const resetCredits = () => {
    setAppliedCredits(0);
  };

  const hasEnoughCredits = (amount: number): boolean => {
    return credits >= amount;
  };

  return {
    credits,
    appliedCredits,
    applyCreditsToCart,
    getFinalTotal,
    resetCredits,
    hasEnoughCredits,
    updateCredits: setCredits
  };
};
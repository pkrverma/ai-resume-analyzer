import { useState, useEffect } from 'react';
import { usePuterStore } from './puter';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { auth, kv } = usePuterStore();

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!auth.isAuthenticated || !auth.user?.username) {
        return;
      }

      try {
        // Check in KV store first (user-specific)
        const userOnboardingKey = `${ONBOARDING_COMPLETED_KEY}:${auth.user.username}`;
        const kvCompleted = await kv.get(userOnboardingKey);
        
        if (kvCompleted === 'true') {
          setIsFirstTime(false);
          return;
        }

        // Fallback to localStorage (device-specific)
        const localCompleted = localStorage.getItem(`${ONBOARDING_COMPLETED_KEY}:${auth.user.username}`);
        
        if (localCompleted === 'true') {
          // Sync to KV store
          await kv.set(userOnboardingKey, 'true');
          setIsFirstTime(false);
          return;
        }

        // User hasn't completed onboarding
        setIsFirstTime(true);
        
        // Don't auto-show onboarding, let components decide when to show it
        
      } catch (error) {
        // Fallback to localStorage only
        const localCompleted = localStorage.getItem(`${ONBOARDING_COMPLETED_KEY}:${auth.user.username}`);
        
        if (localCompleted !== 'true') {
          setIsFirstTime(true);
          // Don't auto-show onboarding, let components decide when to show it
        }
      }
    };

    checkOnboardingStatus();
  }, [auth.isAuthenticated, auth.user?.username, kv]);

  const completeOnboarding = async () => {
    if (!auth.user?.username) return;

    const userOnboardingKey = `${ONBOARDING_COMPLETED_KEY}:${auth.user.username}`;
    
    try {
      // Save to both KV store and localStorage
      await kv.set(userOnboardingKey, 'true');
      localStorage.setItem(userOnboardingKey, 'true');
    } catch (error) {
      // Fallback to localStorage only
      localStorage.setItem(userOnboardingKey, 'true');
    }

    setShowOnboarding(false);
    setIsFirstTime(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
    // Don't mark as completed if user just closes it
  };

  const resetOnboarding = async () => {
    if (!auth.user?.username) return;

    const userOnboardingKey = `${ONBOARDING_COMPLETED_KEY}:${auth.user.username}`;
    
    try {
      await kv.delete(userOnboardingKey);
      localStorage.removeItem(userOnboardingKey);
    } catch (error) {
      localStorage.removeItem(userOnboardingKey);
    }

    setIsFirstTime(true);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isFirstTime,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding
  };
};
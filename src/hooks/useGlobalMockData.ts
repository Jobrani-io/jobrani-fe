import { useState, useEffect } from 'react';

const STORAGE_KEY = 'global-mock-data-enabled';

export const useGlobalMockData = () => {
  const [useMockData, setUseMockData] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : false;
      console.log('useGlobalMockData init - stored:', stored, 'parsed:', parsed);
      return parsed;
    } catch (error) {
      console.log('useGlobalMockData init - error:', error);
      return false;
    }
  });

  const toggleMockData = () => {
    setUseMockData(prev => {
      const newValue = !prev;
      console.log('toggleMockData - prev:', prev, 'newValue:', newValue);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        console.log('toggleMockData - saved to localStorage:', newValue);
      } catch (error) {
        console.log('toggleMockData - localStorage error:', error);
      }
      return newValue;
    });
  };

  useEffect(() => {
    console.log('useGlobalMockData useEffect - useMockData changed to:', useMockData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(useMockData));
      console.log('useGlobalMockData useEffect - saved to localStorage:', useMockData);
    } catch (error) {
      console.log('useGlobalMockData useEffect - localStorage error:', error);
    }
  }, [useMockData]);

  return {
    useMockData,
    toggleMockData,
    setUseMockData
  };
};
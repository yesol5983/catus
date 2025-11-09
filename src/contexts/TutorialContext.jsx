import { createContext, useContext, useState } from 'react';
import { TUTORIAL_COMPLETED_KEY } from '../constants/tutorialSteps';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [isTutorialCompleted, setIsTutorialCompleted, removeTutorialCompleted] = useLocalStorage(TUTORIAL_COMPLETED_KEY, false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // 튜토리얼 시작
  const startTutorial = () => {
    // 이미 시작했거나 완료된 경우 무시
    if (isStarted || isTutorialCompleted) {
      console.log('튜토리얼 이미 시작됨 또는 완료됨, 무시');
      return;
    }
    console.log('튜토리얼 시작!');
    setCurrentStep(0);
    setIsTutorialCompleted(false);
    setIsStarted(true);
  };

  // 다음 단계
  const nextStep = () => {
    console.log('nextStep 호출: 현재 스텝', currentStep, '-> 다음 스텝', currentStep + 1);
    setCurrentStep((prev) => {
      console.log('setCurrentStep: prev=', prev, 'next=', prev + 1);
      return prev + 1;
    });
  };

  // 튜토리얼 완료
  const completeTutorial = () => {
    console.log('튜토리얼 완료!');
    setIsTutorialCompleted(true);
    setIsStarted(false);
  };

  // 튜토리얼 리셋 (테스트용)
  const resetTutorial = () => {
    console.log('튜토리얼 리셋');
    removeTutorialCompleted();
    setCurrentStep(0);
    setIsStarted(false);
  };

  const value = {
    isTutorialCompleted,
    currentStep,
    startTutorial,
    nextStep,
    completeTutorial,
    resetTutorial
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};

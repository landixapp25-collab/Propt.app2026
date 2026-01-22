import { useState, useEffect } from 'react';
import WelcomeModal from './WelcomeModal';
import TourOverlay from './TourOverlay';
import AddToHomeScreenModal from './AddToHomeScreenModal';
import { TOUR_STEPS, markOnboardingCompleted } from '../lib/onboarding';

interface OnboardingTourProps {
  onComplete: () => void;
  onNavigate?: (view: 'dashboard' | 'properties' | 'analyze-deal' | 'saved-deals' | 'profile') => void;
}

export default function OnboardingTour({ onComplete, onNavigate }: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showAddToHome, setShowAddToHome] = useState(false);

  const handleStartTour = () => {
    setShowWelcome(false);
    const firstStep = TOUR_STEPS[0];
    if (firstStep.navigateTo && onNavigate) {
      onNavigate(firstStep.navigateTo);
    }
    setTimeout(() => {
      setCurrentStepIndex(0);
    }, 300);
  };

  const handleSkipTour = () => {
    markOnboardingCompleted();
    onComplete();
  };

  const handleNext = () => {
    const currentStep = TOUR_STEPS[currentStepIndex];

    if (currentStep.id === 'add-to-home') {
      setShowAddToHome(true);
      return;
    }

    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = TOUR_STEPS[nextStepIndex];

      if (nextStep.navigateTo && onNavigate) {
        onNavigate(nextStep.navigateTo);
        setTimeout(() => {
          setCurrentStepIndex(nextStepIndex);
        }, 300);
      } else {
        setCurrentStepIndex(nextStepIndex);
      }
    } else {
      handleCompleteTour();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      const prevStep = TOUR_STEPS[prevStepIndex];

      if (prevStep.navigateTo && onNavigate) {
        onNavigate(prevStep.navigateTo);
        setTimeout(() => {
          setCurrentStepIndex(prevStepIndex);
        }, 300);
      } else {
        setCurrentStepIndex(prevStepIndex);
      }
    }
  };

  const handleCompleteTour = () => {
    markOnboardingCompleted();
    onComplete();
  };

  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < TOUR_STEPS.length) {
      const currentStep = TOUR_STEPS[currentStepIndex];

      if (currentStep.targetSelector) {
        setTimeout(() => {
          const element = document.querySelector(currentStep.targetSelector!);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        }, 400);
      }
    }
  }, [currentStepIndex]);

  if (showWelcome) {
    return <WelcomeModal onStartTour={handleStartTour} onSkip={handleSkipTour} />;
  }

  if (showAddToHome) {
    return (
      <AddToHomeScreenModal
        onDone={handleCompleteTour}
        onSkip={handleCompleteTour}
      />
    );
  }

  if (currentStepIndex >= 0 && currentStepIndex < TOUR_STEPS.length) {
    const currentStep = TOUR_STEPS[currentStepIndex];

    if (currentStep.action === 'open-modal') {
      return (
        <AddToHomeScreenModal
          onDone={handleNext}
          onSkip={handleNext}
        />
      );
    }

    return (
      <TourOverlay
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={TOUR_STEPS.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkipTour}
      />
    );
  }

  return null;
}

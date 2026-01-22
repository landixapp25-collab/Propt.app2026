import { useState, useEffect } from 'react';
import WelcomeModal from './WelcomeModal';
import TourOverlay from './TourOverlay';
import AddToHomeScreenModal from './AddToHomeScreenModal';
import { TOUR_STEPS, markOnboardingCompleted, saveDemoPropertyId } from '../lib/onboarding';
import { propertyService } from '../lib/database';

interface OnboardingTourProps {
  onComplete: () => void;
  onNavigate?: (view: 'dashboard' | 'properties' | 'analyze-deal' | 'saved-deals' | 'profile') => void;
  onNavigateToProperty?: (propertyId: string) => void;
}

export default function OnboardingTour({ onComplete, onNavigate, onNavigateToProperty }: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showAddToHome, setShowAddToHome] = useState(false);

  const handleStartTour = async () => {
    setShowWelcome(false);

    try {
      // Delete existing demo properties
      await propertyService.deleteDemoProperties();

      // Create new demo property
      const demoProperty = await propertyService.create({
        name: '123 Demo Avenue',
        purchasePrice: 150000,
        purchaseDate: '2024-01-15',
        propertyType: 'House',
        currentValue: 180000,
        status: 'Stabilized',
        isDemo: true,
      });

      // Save the demo property ID to localStorage
      if (demoProperty?.id) {
        saveDemoPropertyId(demoProperty.id);
        console.log('Demo property created with ID:', demoProperty.id);
      } else {
        console.error('Failed to create demo property - no ID returned');
      }
    } catch (error) {
      console.error('Failed to create demo property:', error);
    }

    // Navigate to first step
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
    console.log('handleNext called, current step:', currentStep.id);

    if (currentStep.id === 'add-to-home') {
      setShowAddToHome(true);
      return;
    }

    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = TOUR_STEPS[nextStepIndex];
      console.log('Next step:', nextStep.id);

      // Check if current and next steps need property detail page
      const currentNeedsPropertyDetail = currentStep.id === 'transactions' || currentStep.id === 'receipt-upload';
      const nextNeedsPropertyDetail = nextStep.id === 'transactions' || nextStep.id === 'receipt-upload';

      console.log('Current needs property detail:', currentNeedsPropertyDetail);
      console.log('Next needs property detail:', nextNeedsPropertyDetail);

      // If both current and next are property detail steps, just advance without navigating
      if (currentNeedsPropertyDetail && nextNeedsPropertyDetail) {
        console.log('Staying on property detail page, just advancing step');
        setCurrentStepIndex(nextStepIndex);
        return;
      }

      // Only navigate to property detail if moving FROM a non-property-detail step TO a property-detail step
      if (nextNeedsPropertyDetail && !currentNeedsPropertyDetail) {
        console.log('Navigating to property detail page');
        if (onNavigateToProperty) {
          const demoPropertyId = localStorage.getItem('propt_demo_property_id');
          console.log('Demo property ID from localStorage:', demoPropertyId);
          if (demoPropertyId) {
            console.log('Calling onNavigateToProperty with ID:', demoPropertyId);
            onNavigateToProperty(demoPropertyId);
            setTimeout(() => {
              setCurrentStepIndex(nextStepIndex);
            }, 500);
            return;
          } else {
            console.error('No demo property ID found in localStorage');
          }
        } else {
          console.error('onNavigateToProperty callback is not defined');
        }
      }

      if (nextStep.navigateTo && onNavigate) {
        console.log('Navigating to view:', nextStep.navigateTo);
        onNavigate(nextStep.navigateTo);
        setTimeout(() => {
          setCurrentStepIndex(nextStepIndex);
        }, 300);
      } else {
        console.log('No navigation needed, just updating step');
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
      const currentStep = TOUR_STEPS[currentStepIndex];

      // If going back from receipt-upload to transactions, just update step index
      if (currentStep.id === 'receipt-upload' && prevStep.id === 'transactions') {
        setCurrentStepIndex(prevStepIndex);
        return;
      }

      // If going back from transactions, navigate to previous view
      if (currentStep.id === 'transactions' && prevStep.navigateTo && onNavigate) {
        onNavigate(prevStep.navigateTo);
        setTimeout(() => {
          setCurrentStepIndex(prevStepIndex);
        }, 300);
        return;
      }

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

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { TourStep, getElementPosition } from '../lib/onboarding';

interface TourOverlayProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function TourOverlay({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: TourOverlayProps) {
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (step.targetSelector) {
      const updatePosition = () => {
        const rect = getElementPosition(step.targetSelector!);
        setTargetRect(rect);

        if (rect) {
          const tooltipWidth = 320;
          const tooltipHeight = 200;
          const padding = 16;

          let top = 0;
          let left = 0;

          switch (step.position) {
            case 'bottom':
              top = rect.top + rect.height + padding;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'top':
              top = rect.top - tooltipHeight - padding;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left - tooltipWidth - padding;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left + rect.width + padding;
              break;
            default:
              top = rect.top + rect.height + padding;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
          }

          left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
          top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

          setTooltipPosition({ top, left });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onSkip}
      />

      {targetRect && (
        <>
          <div
            className="absolute rounded-lg transition-all duration-300 pointer-events-none"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 4px rgba(90, 154, 168, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)',
              zIndex: 51,
            }}
          />

          <div
            className="absolute animate-pulse"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              border: '2px solid #5a9aa8',
              borderRadius: '8px',
              zIndex: 51,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      <div
        className="absolute bg-white rounded-xl shadow-2xl p-6 transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '320px',
          zIndex: 52,
        }}
      >
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all"
                style={{
                  backgroundColor: i <= currentStepIndex ? '#5a9aa8' : '#E5E7EB',
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color: '#5a9aa8' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
        </div>

        <h3 className="text-xl font-bold mb-3" style={{ color: '#1F2937' }}>
          {step.title}
        </h3>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {step.message}
        </p>

        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#5a9aa8' }}
          >
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            {currentStepIndex < totalSteps - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

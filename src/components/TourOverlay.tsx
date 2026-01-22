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

  const isCompact = step.id === 'dashboard' || step.id === 'add-property';

  useEffect(() => {
    if (step.targetSelector) {
      const updatePosition = () => {
        const rect = getElementPosition(step.targetSelector!);
        setTargetRect(rect);

        if (rect) {
          const tooltipWidth = 320;
          const tooltipHeight = 250;
          const padding = 16;

          let top = 0;
          let left = 0;

          if (step.id === 'dashboard' || step.id === 'add-property') {
            top = window.innerHeight - 280;
            left = padding;
          } else {
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

            if (top + tooltipHeight > window.innerHeight - padding) {
              top = Math.max(padding, rect.top - tooltipHeight - padding);
            }

            if (top < padding) {
              top = Math.max(padding, Math.min(window.innerHeight / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding));
            }
          }

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
    } else {
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 160
      });
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark backdrop overlay */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onSkip}
      />

      {targetRect && (
        <>
          {/* Spotlight cutout with enhanced pulsing glow */}
          <div
            className="absolute rounded-lg transition-all duration-300 pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 4px rgba(90, 154, 168, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
              zIndex: 51,
            }}
          />

          {/* Pulsing animated border */}
          <div
            className="absolute"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              border: '3px solid #5a9aa8',
              borderRadius: '12px',
              zIndex: 51,
              pointerEvents: 'none',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />

          {/* Additional outer glow ring */}
          <div
            className="absolute"
            style={{
              top: targetRect.top - 12,
              left: targetRect.left - 12,
              width: targetRect.width + 24,
              height: targetRect.height + 24,
              border: '2px solid rgba(90, 154, 168, 0.4)',
              borderRadius: '16px',
              zIndex: 50,
              pointerEvents: 'none',
              animation: 'pulse-outer 2s ease-in-out infinite',
            }}
          />
        </>
      )}

      <div
        className="absolute bg-white rounded-xl shadow-2xl transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: isCompact ? '240px' : '320px',
          padding: isCompact ? '12px' : '20px',
          maxHeight: 'calc(100vh - 32px)',
          zIndex: 52,
        }}
      >
        <button
          onClick={onSkip}
          className="absolute text-gray-400 hover:text-gray-600 transition-colors"
          style={{
            top: isCompact ? '8px' : '16px',
            right: isCompact ? '8px' : '16px'
          }}
        >
          <X className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>

        <div className={isCompact ? 'mb-2' : 'mb-4'}>
          <div className={`flex items-center justify-center mb-2 ${isCompact ? 'gap-1' : 'gap-2'}`}>
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isFuture = i > currentStepIndex;

              return (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: isCompact ? '8px' : '12px',
                    height: isCompact ? '8px' : '12px',
                    backgroundColor: isCompleted || isCurrent ? '#5a9aa8' : '#D1D5DB',
                    border: isCurrent ? '2px solid #5a9aa8' : 'none',
                    outline: isCurrent ? '2px solid white' : 'none',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>
          <p className={`font-medium text-center ${isCompact ? 'text-xs' : 'text-sm'}`} style={{ color: '#5a9aa8' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
        </div>

        <h3 className={`font-bold ${isCompact ? 'text-base mb-2' : 'text-xl mb-3'}`} style={{ color: '#1F2937' }}>
          {step.title}
        </h3>

        <p className={`text-gray-600 leading-relaxed ${isCompact ? 'text-sm mb-3' : 'mb-6'}`}>
          {step.message}
        </p>

        <div className={`flex ${isCompact ? 'gap-2' : 'gap-3'}`}>
          {currentStepIndex > 0 && (
            <button
              onClick={onBack}
              className={`flex items-center gap-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
                isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
              }`}
            >
              <ArrowLeft className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 ${
              isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
            }`}
            style={{ backgroundColor: '#5a9aa8' }}
          >
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            {currentStepIndex < totalSteps - 1 && <ArrowRight className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />}
          </button>
        </div>
      </div>
    </div>
  );
}

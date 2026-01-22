import { Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export default function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5a9aa8' }}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4" style={{ color: '#1F2937' }}>
            Welcome to Propt!
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Let's take a quick 2-minute tour to show you around.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <p className="font-semibold mb-3" style={{ color: '#1F2937' }}>
              You'll learn:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>How to add properties and track expenses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>How AI extracts receipt data automatically</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>How to export your tax-ready pack</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>How to add Propt to your home screen</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onStartTour}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#5a9aa8' }}
            >
              Start Tour
            </button>
            <button
              onClick={onSkip}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all hover:bg-gray-100"
              style={{ color: '#6B7280' }}
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

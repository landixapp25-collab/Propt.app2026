import { Monitor, Share2, MoreVertical, Home } from 'lucide-react';
import { detectDevice } from '../lib/onboarding';

interface AddToHomeScreenModalProps {
  onDone: () => void;
  onSkip: () => void;
}

export default function AddToHomeScreenModal({ onDone, onSkip }: AddToHomeScreenModalProps) {
  const device = detectDevice();

  const renderIOSInstructions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#5a9aa8' }}>
          <Home className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Add Propt to Your iPhone
        </h3>
        <p className="text-gray-600">
          Get the full app experience with one tap
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            1
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Tap the Share button
            </p>
            <p className="text-gray-600 text-sm">
              Look for the <Share2 className="w-4 h-4 inline" /> share icon at the bottom of Safari
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            2
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Scroll down
            </p>
            <p className="text-gray-600 text-sm">
              Find and tap "Add to Home Screen"
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            3
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Tap "Add"
            </p>
            <p className="text-gray-600 text-sm">
              Propt will appear on your home screen like a native app
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#5a9aa8' }}>
          <Home className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Add Propt to Your Android
        </h3>
        <p className="text-gray-600">
          Install Propt for quick access
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            1
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Tap the menu icon
            </p>
            <p className="text-gray-600 text-sm">
              Look for <MoreVertical className="w-4 h-4 inline" /> three dots in the top right of Chrome
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            2
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Tap "Add to Home screen"
            </p>
            <p className="text-gray-600 text-sm">
              Or "Install app" if that option appears
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a9aa8' }}>
            3
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>
              Tap "Add"
            </p>
            <p className="text-gray-600 text-sm">
              Propt will work like a native app on your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesktopInstructions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#5a9aa8' }}>
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Best Experienced on Mobile
        </h3>
        <p className="text-gray-600">
          Propt is optimized for mobile use
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-700 mb-4">
          Open this link on your phone for the best experience:
        </p>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <code className="text-sm font-mono" style={{ color: '#5a9aa8' }}>
            {window.location.origin}
          </code>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Or bookmark this page for easy access from your desktop
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {device === 'ios' && renderIOSInstructions()}
          {device === 'android' && renderAndroidInstructions()}
          {device === 'desktop' && renderDesktopInstructions()}

          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={onDone}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#5a9aa8' }}
            >
              Done
            </button>
            <button
              onClick={onSkip}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all hover:bg-gray-100"
              style={{ color: '#6B7280' }}
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

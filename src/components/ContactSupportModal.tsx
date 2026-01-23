import { useState, FormEvent } from 'react';
import { X, Mail, MessageSquare, Send } from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inquiryTypes = [
  'Bug Report',
  'Feature Request',
  'Billing Question',
  'General Inquiry',
  'Technical Support',
  'Account Issue',
];

export default function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [formData, setFormData] = useState({
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailBody = `Subject: ${formData.subject}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`;
    window.location.href = `mailto:hello@propt.app?subject=${encodeURIComponent(formData.subject)}&body=${emailBody}`;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ subject: 'General Inquiry', message: '' });
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#537d90] px-6 py-4 flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-[#F8F9FA]" />
            <h2 className="text-xl font-bold text-[#F8F9FA]">Contact Support</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-[#F8F9FA] transition-colors">
            <X size={24} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600">
              We'll respond within 24 hours to your email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] outline-none transition-colors"
                required
              >
                {inquiryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare size={18} className="text-gray-400" />
                </div>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] outline-none transition-colors resize-none"
                  placeholder="Please describe your inquiry in detail..."
                  required
                  minLength={10}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will open your email client with a pre-filled message to hello@propt.app
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#4ECDC4] text-white font-semibold rounded-lg hover:bg-[#45b8b0] active:bg-[#3da39c] transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

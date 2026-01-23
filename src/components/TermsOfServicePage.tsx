import { ArrowLeft } from 'lucide-react';

interface TermsOfServicePageProps {
  onBack: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-700" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-[#F8F9FA] hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#F8F9FA]">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#537d90] rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#F8F9FA] mb-2">Terms of Service</h2>
            <p className="text-sm text-gray-300">Last updated: January 23, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">1. Agreement to Terms</h3>
              <p>
                By accessing or using Propt, you agree to be bound by these Terms of Service and all applicable
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using
                this application.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">2. Use License</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable license to use Propt for personal or
                business property management purposes, subject to these Terms of Service.
              </p>
              <p className="mt-2">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Modify or copy the application materials</li>
                <li>Use the materials for any commercial purpose without authorization</li>
                <li>Attempt to reverse engineer any software contained in Propt</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person or mirror on any other server</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">3. User Accounts</h3>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information
                at all times. You are responsible for safeguarding your account credentials and for any activities
                or actions under your account.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">4. Subscription and Billing</h3>
              <p>
                Propt offers both free and paid subscription plans. Paid subscriptions are billed on a monthly
                basis. You may cancel your subscription at any time, and you will continue to have access until
                the end of your billing period.
              </p>
              <p className="mt-2">
                Founder pricing (£12/month) is locked forever for early adopters. Regular pricing (£25/month)
                applies to new users after the founder pricing period ends.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">5. User Content</h3>
              <p>
                You retain all rights to any content you submit, post or display on or through Propt. By
                submitting content, you grant us a license to use, modify, and display that content solely
                for the purpose of providing our services to you.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">6. AI-Powered Features</h3>
              <p>
                Propt uses artificial intelligence to analyze receipts and property deals. While we strive for
                accuracy, AI-generated information may contain errors. You are responsible for verifying all
                information before making financial decisions.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">7. Disclaimer</h3>
              <p>
                Propt is provided "as is" without any warranties, expressed or implied. We do not warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>The service will function uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The application is free of viruses or harmful components</li>
                <li>Results obtained from using the service will be accurate or reliable</li>
              </ul>
              <p className="mt-2">
                <strong>Financial Advice Disclaimer:</strong> Propt is not a financial advisor. The information
                and calculations provided are for informational purposes only and should not be considered
                financial, investment, or legal advice. Always consult with qualified professionals before
                making investment decisions.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">8. Limitation of Liability</h3>
              <p>
                In no event shall Propt or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or
                inability to use Propt.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">9. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your data. However,
                no method of transmission over the Internet is 100% secure. While we strive to protect your
                personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">10. Termination</h3>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for
                any reason, including if you breach these Terms of Service. Upon termination, your right to
                use the service will immediately cease.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">11. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material
                changes. Your continued use of Propt after such modifications constitutes your acceptance of
                the updated terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">12. Governing Law</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the United Kingdom,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">13. Contact Information</h3>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> hello@propt.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

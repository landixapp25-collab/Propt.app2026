import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-700" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-[#F8F9FA] hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#F8F9FA]">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#537d90] rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#F8F9FA] mb-2">Privacy Policy</h2>
            <p className="text-sm text-gray-300">Last updated: January 23, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">1. Introduction</h3>
              <p>
                Welcome to Propt. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data when you visit
                our application and tell you about your privacy rights.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">2. Data We Collect</h3>
              <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Identity Data:</strong> name, email address</li>
                <li><strong>Contact Data:</strong> phone number, company name</li>
                <li><strong>Financial Data:</strong> property purchase prices, transaction amounts, rental income</li>
                <li><strong>Transaction Data:</strong> details about payments to and from you</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> information about how you use our application</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">3. How We Use Your Data</h3>
              <p>We use your personal data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>To provide and maintain our service</li>
                <li>To manage your account and property portfolio</li>
                <li>To process transactions and send notifications</li>
                <li>To provide AI-powered features like receipt analysis and deal evaluation</li>
                <li>To improve and optimize our application</li>
                <li>To communicate with you about updates and support</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">4. Data Security</h3>
              <p>
                We have implemented appropriate security measures to prevent your personal data from being
                accidentally lost, used, accessed, altered or disclosed. All data is encrypted in transit and
                at rest. We use Supabase for secure authentication and database storage.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">5. Data Retention</h3>
              <p>
                We will only retain your personal data for as long as necessary to fulfil the purposes we
                collected it for. When you delete your account, we will delete or anonymize your personal data.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">6. Your Legal Rights</h3>
              <p>Under data protection laws, you have rights including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Right to access your personal data</li>
                <li>Right to correction of your personal data</li>
                <li>Right to erasure of your personal data</li>
                <li>Right to object to processing of your personal data</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">7. Third-Party Services</h3>
              <p>
                We use third-party services to provide our application, including Supabase for authentication
                and data storage, and AI services for receipt analysis. These services have their own privacy
                policies and we encourage you to review them.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">8. Cookies</h3>
              <p>
                We use essential cookies to enable core functionality like authentication. We do not use
                advertising or tracking cookies. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">9. Changes to This Policy</h3>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by
                posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">10. Contact Us</h3>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
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

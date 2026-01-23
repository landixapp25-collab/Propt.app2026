import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface HelpCenterPageProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Simply click "Sign Up" on the landing page and enter your email and password. You\'ll be logged in automatically and can start adding properties right away.',
      },
      {
        question: 'What can I do with the free plan?',
        answer: 'The free plan includes 1 property, up to 10 transactions per month, basic analytics, and full mobile app access. Perfect for getting started!',
      },
      {
        question: 'How do I add my first property?',
        answer: 'Click the "Add Property" button on your dashboard, then fill in the property details including name, purchase price, date, and type. You can add transactions and receipts once the property is created.',
      },
    ],
  },
  {
    title: 'Managing Properties',
    icon: '🏠',
    items: [
      {
        question: 'How do I track property expenses?',
        answer: 'Click on a property to view its details, then use "Add Transaction" to log expenses. You can categorize expenses as maintenance, utilities, insurance, and more.',
      },
      {
        question: 'Can I edit or delete a property?',
        answer: 'Yes! Click on any property to view its details, then use the menu options to edit information or delete the property. Note: Deleting a property will also remove all associated transactions.',
      },
      {
        question: 'What property types are supported?',
        answer: 'Propt supports Houses, Flats, and Commercial properties. You can specify the type when adding a new property.',
      },
    ],
  },
  {
    title: 'Receipt Management',
    icon: '📄',
    items: [
      {
        question: 'How do I upload receipts?',
        answer: 'When adding or editing a transaction, click "Upload Receipt" and select an image or PDF. Our AI will automatically extract key details from the receipt.',
      },
      {
        question: 'What file types are supported for receipts?',
        answer: 'We support JPG, PNG, and PDF files. Images are automatically optimized for storage while maintaining quality.',
      },
      {
        question: 'How does AI receipt extraction work?',
        answer: 'Our AI analyzes your receipt images to automatically extract date, amount, vendor, and category information. Pro plan users get 100 AI extractions per month.',
      },
    ],
  },
  {
    title: 'Tax Pack Exports',
    icon: '💼',
    items: [
      {
        question: 'How do I export my tax documents?',
        answer: 'Pro users can export complete tax packs with all transactions organized by property. Go to a property\'s details and click "Export Tax Pack" to download CSV or PDF reports.',
      },
      {
        question: 'What information is included in the tax pack?',
        answer: 'Tax packs include all transactions with dates, amounts, categories, descriptions, and attached receipts. Everything your accountant needs in one organized package.',
      },
      {
        question: 'Can I filter transactions by date for tax year exports?',
        answer: 'Yes! Use the date filters on the property details page to select specific date ranges before exporting. Perfect for matching your tax year.',
      },
    ],
  },
  {
    title: 'BRRR Calculator',
    icon: '📊',
    items: [
      {
        question: 'What is the BRRR deal analyzer?',
        answer: 'BRRR (Buy, Refurbish, Rent, Refinance) is a property investment strategy. Our analyzer helps you evaluate potential deals by calculating ROI, cash flow, and refinance potential.',
      },
      {
        question: 'How accurate are the BRRR calculations?',
        answer: 'Our calculations use current market data and your inputs to provide realistic estimates. Always consult with a financial advisor before making investment decisions.',
      },
      {
        question: 'Can I save BRRR analyses for later?',
        answer: 'Yes! Pro users can save unlimited deal analyses. View them in the "Saved Deals" section and move promising deals to your portfolio when ready.',
      },
    ],
  },
  {
    title: 'Billing & Subscription',
    icon: '💳',
    items: [
      {
        question: 'How much does Pro cost?',
        answer: 'Pro is £12/month with our founder pricing (locked forever). Regular price is £25/month. Founder pricing is available for early adopters and never increases.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We\'re currently setting up payment processing. Contact support@propt.app to upgrade and we\'ll get you started with founder pricing.',
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes! You can cancel anytime and will retain Pro access until the end of your billing period. No long-term commitments required.',
      },
    ],
  },
];

export default function HelpCenterPage({ onBack }: HelpCenterPageProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, number>>({});

  const toggleQuestion = (sectionTitle: string, index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle] === index ? -1 : index,
    }));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-700" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-[#F8F9FA] hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#F8F9FA]">Help Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#F8F9FA] mb-2">How can we help you?</h2>
          <p className="text-gray-300">Find answers to common questions about Propt</p>
        </div>

        <div className="space-y-6">
          {faqSections.map((section) => (
            <div key={section.title} className="bg-[#537d90] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="text-xl font-bold text-[#F8F9FA]">{section.title}</h3>
                </div>
              </div>

              <div className="divide-y divide-gray-600">
                {section.items.map((item, index) => {
                  const isExpanded = expandedSections[section.title] === index;

                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleQuestion(section.title, index)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#647d8f] transition-colors text-left"
                      >
                        <span className="font-medium text-[#F8F9FA] pr-4">{item.question}</span>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-300 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-300 flex-shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#537d90] rounded-xl p-6 text-center border border-gray-600">
          <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-4">Our support team is here to help</p>
          <a
            href="mailto:support@propt.app"
            className="inline-block px-6 py-3 bg-[#4ECDC4] text-white rounded-lg font-semibold hover:bg-[#45b8b0] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

import { JSX, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Faq = (): JSX.Element => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Is there a free trial available?',
      answer:
        "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      question: 'Can I change my plan later?',
      answer:
        'Of course. Our pricing scales with your company. Chat to our friendly team to find a solution that works for you.',
    },
    {
      question: 'What is your cancellation policy?',
      answer:
        "We understand that things change. You can cancel your plan at any time and we'll refund you the difference already paid.",
    },
    {
      question: 'Can other info be added to an invoice?',
      answer:
        'Yes, you can add additional information to your invoices including custom fields, notes, and attachments.',
    },
    {
      question: 'How does billing work?',
      answer:
        'Plans are per workspace, not per account. You can upgrade one workspace, and still have any number of free workspaces.',
    },
    {
      question: 'How do I change my account email?',
      answer:
        "You can change your account email from your account settings. We'll send a verification email to your new address.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-border rounded-lg border">
              <button
                className="hover:bg-muted/50 flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-foreground font-semibold">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="text-primary h-5 w-5" />
                ) : (
                  <Plus className="text-primary h-5 w-5" />
                )}
              </button>
              {openIndex === index && (
                <div className="text-muted-foreground px-6 pb-4">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="mb-4 flex items-center justify-center space-x-4">
            <div className="flex -space-x-2">
              <div className="bg-primary h-10 w-10 rounded-full border-2 border-white"></div>
              <div className="bg-medical-teal h-10 w-10 rounded-full border-2 border-white"></div>
              <div className="bg-muted h-10 w-10 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" child={'Get in touch'} />
        </div>
      </div>
    </section>
  );
};

export default Faq;

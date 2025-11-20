import { JSX, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Faq = (): JSX.Element => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I book an appointment with a doctor?',
      answer:
        'Simply sign up, verify your email, and browse our directory of healthcare providers by specialty or location. Select your preferred doctor, choose an available time slot, and complete payment to confirm your appointment. You can attend virtually or in-person based on your preference.',
    },
    {
      question: 'Can I access my medical records on the platform?',
      answer:
        'Yes! Once you register and verify your account, you can access your medical records anytime, anywhere. All your consultation history, prescriptions, and health information are securely stored and easily accessible through your dashboard.',
    },
    {
      question: 'How do I register as a healthcare provider?',
      answer:
        "Healthcare providers can sign up and complete our onboarding process, which includes credential verification. You'll set up your profile with your specialty, location, and pricing, then create your availability schedule. Once approved, patients can start booking appointments with you.",
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We support various payment methods including mobile money and other secure payment options. You can set your payment preference during registration, and all transactions are processed securely through our platform.',
    },
    {
      question: 'Can I cancel or reschedule my appointment?',
      answer:
        "Yes, you can manage your appointments through your dashboard. You can cancel or reschedule appointments based on the doctor's cancellation policy. Please check the specific terms when booking your appointment.",
    },
    {
      question: 'How do virtual consultations work?',
      answer:
        "Virtual consultations are conducted through our integrated video platform. Once you book an appointment, you'll receive access details. Simply join at your scheduled time using any device with internet access for a secure, private consultation.",
    },
    {
      question: 'Is my health information secure?',
      answer:
        'Absolutely. We take data security and patient privacy seriously. All medical records and personal information are encrypted and stored securely. We comply with healthcare data protection standards to ensure your information remains confidential and protected.',
    },
    {
      question: 'How do doctors manage their schedules?',
      answer:
        "Doctors can easily create and manage their availability by setting up time slots through their dashboard. You'll receive appointment requests that you can confirm or decline. The platform helps streamline scheduling so you can focus on patient care.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Everything you need to know about booking appointments, managing your health, and
            connecting with healthcare providers.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map(({ question, answer }, index) => (
            <motion.div
              key={question}
              className={cn(
                'border-border overflow-hidden rounded-lg border transition-colors',
                openIndex === index && 'bg-muted/10',
              )}
            >
              <button
                className="hover:bg-muted/50 flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-foreground font-semibold">{question}</span>
                <motion.div
                  animate={{
                    rotate: openIndex === index ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? (
                    <Minus className="text-primary h-5 w-5" />
                  ) : (
                    <Plus className="text-primary h-5 w-5" />
                  )}
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground px-6 pt-0 pb-4"
                    >
                      {answer}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        {/*  Implemet this when we do the chat the system */}
        {/* <div className="mt-12 text-center">
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
        </div> */}
      </div>
    </section>
  );
};

export default Faq;

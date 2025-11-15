'use client';
import { Logo } from '@/assets/images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, UserCheck, Clock, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';
import { BRANDING } from '@/constants/branding.constant';

const Policy = (): JSX.Element => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto sm:px-1 md:px-4">
        <div className="mx-auto max-w-6xl text-center">
          <>
            <div>
              <header
                className="supports-[backdrop-filter]:bg-bg-gray-50/60 sticky top-0 z-50 border-b bg-gray-50/95 backdrop-blur"
                style={{ boxShadow: 'var(--header-shadow)' }}
              >
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => router.back()}>
                        <Image className="h-8 w-8 text-blue-400" src={Logo} alt="Logo" />
                      </button>
                      <h1 className="text-2xl font-bold">{BRANDING.APP_NAME}</h1>
                    </div>
                    <Badge variant="brown" className="text-sm">
                      <Clock className="mr-1 h-4 w-4" />
                      Last Updated:{' '}
                      {new Date('2025, 09, 10').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Badge>
                  </div>
                </div>
              </header>
              <Separator />
              <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-12 text-center">
                  <h1 className="text-foreground mb-4 text-2xl font-bold md:text-4xl">
                    Privacy Policy
                  </h1>
                  <p className="text-muted-foreground mx-auto max-w-2xl text-[18px]">
                    Your privacy and data security are our top priorities. This policy explains how
                    we handle information for both healthcare professionals and patients.
                  </p>
                </div>

                <div className="mb-12 grid gap-6 md:grid-cols-2">
                  <Card className="hover:border-border-blue-400/40 border-blue-400/20 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-md flex items-center text-blue-400 md:text-2xl">
                        <UserCheck className="mr-2 h-6 w-6" />
                        For Health care Professionals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Enhanced privacy protections for medical professionals, including HIPAA
                        compliance and professional data security.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-400/20 transition-colors hover:border-green-400/40">
                    <CardHeader>
                      <CardTitle className="text-md flex items-center border-green-400 text-green-400 md:text-2xl">
                        <Users className="mr-2 h-6 w-6" />
                        For Patients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Comprehensive patient privacy rights and medical information protection
                        under healthcare regulations.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8 text-left">
                  <Card>
                    <CardHeader>
                      <CardTitle>1. Information We Collect</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold text-blue-400">
                          For Healthcare Professionals:
                        </h4>
                        <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                          <li>Professional credentials and licensing information</li>
                          <li>Medical practice details and specializations</li>
                          <li>Professional contact information</li>
                          <li>Continuing education records (when applicable)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-green-400">For Patients:</h4>
                        <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                          <li>Personal identification information</li>
                          <li>Medical history and health records</li>
                          <li>Insurance information</li>
                          <li>Treatment preferences and consent records</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>2. How We Use Your Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        We use your information solely for legitimate healthcare purposes:
                      </p>
                      <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                        <li>Providing and coordinating medical care</li>
                        <li>
                          Facilitating communication between healthcare providers and patients
                        </li>
                        <li>Maintaining accurate medical records</li>
                        <li>Complying with legal and regulatory requirements</li>
                        <li>Improving healthcare services and patient outcomes</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>3. Data Security & Protection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-section-bg rounded-lg p-4">
                        <h4 className="mb-2 font-semibold">Security Measures:</h4>
                        <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                          <li>End-to-end encryption for all medical data</li>
                          <li>Multi-factor authentication for all users</li>
                          <li>Regular security audits and compliance checks</li>
                          <li>Secure data centers with 24/7 monitoring</li>
                          <li>Role-based access controls</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>4. HIPAA Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        We are fully committed to HIPAA compliance and protecting your health
                        information:
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-blue-100 p-4">
                          <h5 className="mb-2 font-semibold text-blue-400">Your Rights</h5>
                          <ul className="text-muted-foreground space-y-1 text-sm">
                            <li>• Access your health records</li>
                            <li>• Request corrections to your information</li>
                            <li>• Request restrictions on use/disclosure</li>
                            <li>• File complaints about privacy practices</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-gray-100 p-4">
                          <h5 className="text-foreground mb-2 font-semibold">Our Obligations</h5>
                          <ul className="text-muted-foreground space-y-1 text-sm">
                            <li>• Maintain privacy of health information</li>
                            <li>• Provide notice of privacy practices</li>
                            <li>• Implement appropriate safeguards</li>
                            <li>• Report breaches when they occur</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>5. Information Sharing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground mb-4">
                        We only share your information in the following circumstances:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-blue-400"></div>
                          <div>
                            <h5 className="font-semibold">Treatment Coordination</h5>
                            <p className="text-muted-foreground text-sm">
                              With your healthcare team for continuity of care
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-green-400"></div>
                          <div>
                            <h5 className="font-semibold">Legal Requirements</h5>
                            <p className="text-muted-foreground text-sm">
                              When required by law or court order
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-amber-300"></div>
                          <div>
                            <h5 className="font-semibold">Your Consent</h5>
                            <p className="text-muted-foreground text-sm">
                              With your explicit written authorization
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact & Rights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>6. Contact Us & Your Rights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="mb-3 font-semibold">Privacy Officer Contact:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-blue-400" />
                            <span className="text-muted-foreground">{BRANDING.CONTACT_EMAIL}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <span className="text-muted-foreground">{BRANDING.CONTACT_PHONE}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-section-bg rounded-lg p-4">
                        <h4 className="mb-2 font-semibold">Changes to This Policy</h4>
                        <p className="text-muted-foreground text-sm">
                          We may update this privacy policy from time to time. We will notify you of
                          any material changes by posting the new policy on our website and sending
                          notifications to registered users.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Footer */}
                <div className="mt-12 border-t py-8 text-center">
                  <p className="text-muted-foreground">
                    This privacy policy is effective as of September 10, 2025 . For questions about
                    this policy, please contact our Privacy Officer using the information provided
                    above.
                  </p>
                </div>
              </main>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Policy;

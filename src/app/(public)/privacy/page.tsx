import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | RallyPoint',
  description: 'Privacy policy for RallyPoint civic engagement platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[960px] mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-on-surface font-headline mb-4">Privacy Policy</h1>
        <p className="text-on-surface-variant">Last updated: March 21, 2026</p>
      </div>

      <div className="prose prose-neutral max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">1. Information We Collect</h2>
          <p className="text-on-surface-variant mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mb-4 text-on-surface-variant space-y-2">
            <li>Account information (name, email address)</li>
            <li>Location data (for local civic issue recommendations)</li>
            <li>Your civic interests and preferences</li>
            <li>Engagement data (issues you support, comments, saves)</li>
            <li>Device and usage information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">2. How We Use Your Information</h2>
          <p className="text-on-surface-variant mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 text-on-surface-variant space-y-2">
            <li>Provide, operate, and maintain our services</li>
            <li>Personalize your civic issue recommendations</li>
            <li>Send you updates about civic issues in your area</li>
            <li>Improve and optimize our platform</li>
            <li>Communicate with you about your account</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">3. Data Sharing</h2>
          <p className="text-on-surface-variant mb-4">We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 mb-4 text-on-surface-variant space-y-2">
            <li>Service providers who assist in our operations</li>
            <li>Government entities when required by law</li>
            <li>With your consent, to civic organizations you choose to support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">4. Data Security</h2>
          <p className="text-on-surface-variant mb-4">
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">5. Your Rights</h2>
          <p className="text-on-surface-variant mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 text-on-surface-variant space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">6. Cookies and Tracking</h2>
          <p className="text-on-surface-variant mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 mb-4 text-on-surface-variant space-y-2">
            <li>Maintain your session</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage</li>
            <li>Improve user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">7. Children's Privacy</h2>
          <p className="text-on-surface-variant mb-4">
            Our service is not intended for children under 13. We do not knowingly collect
            personal information from children under 13. If you are a parent or guardian and
            believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">8. Changes to This Policy</h2>
          <p className="text-on-surface-variant mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-4">9. Contact Us</h2>
          <p className="text-on-surface-variant mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-surface-container-low p-4 rounded-2xl">
            <p className="text-on-surface-variant">Email: privacy@rallypoint.app</p>
            <p className="text-on-surface-variant">Address: 123 Civic Center Dr, Tempe, AZ 85281</p>
          </div>
        </section>
      </div>
    </div>
  )
}

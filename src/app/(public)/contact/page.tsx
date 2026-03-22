'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-on-surface font-headline mb-4">Contact Us</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
          Have questions about RallyPoint? We're here to help you engage with your community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">Email</h3>
                <p className="text-on-surface-variant">support@rallypoint.app</p>
                <p className="text-sm text-on-surface-variant">General inquiries and support</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">Office</h3>
                <p className="text-on-surface-variant">123 Civic Center Dr</p>
                <p className="text-on-surface-variant">Your Local Area</p>
                <p className="text-sm text-on-surface-variant">By appointment only</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">Phone</h3>
                <p className="text-on-surface-variant">(480) 555-1234</p>
                <p className="text-sm text-on-surface-variant">Mon-Fri, 9am-5pm MST</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-surface-container-low rounded-2xl">
            <h3 className="font-semibold text-on-surface mb-3">Response Time</h3>
            <p className="text-on-surface-variant mb-2">
              We typically respond to inquiries within 24-48 hours during business days.
            </p>
            <p className="text-sm text-on-surface-variant">
              For urgent matters related to platform security or abuse, please include "URGENT" in your subject line.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold text-on-surface font-headline mb-6">Send a Message</h2>

          {isSubmitted ? (
            <div className="bg-[var(--co-success)]/5 border border-[var(--co-success)]/20 rounded-2xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-[var(--co-success)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-on-surface mb-2">Message Sent!</h3>
              <p className="text-on-surface-variant">
                Thank you for contacting us. We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-on-surface mb-2">Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                  className="field w-full" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                  className="field w-full" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-on-surface mb-2">Subject *</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                  className="field w-full bg-surface-container-lowest">
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Product Feedback</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="press">Press Inquiry</option>
                  <option value="legal">Legal Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-on-surface mb-2">Message *</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5}
                  className="field w-full" placeholder="How can we help you?" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <><div className="h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />Sending...</>
                ) : (
                  <><Send className="h-5 w-5" />Send Message</>
                )}
              </button>
              <p className="text-sm text-on-surface-variant text-center">
                By submitting this form, you agree to our{' '}
                <a href="/privacy" className="text-primary hover:text-primary-container font-medium">Privacy Policy</a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-8 border-t border-outline-variant/15">
        <h2 className="text-2xl font-semibold text-on-surface font-headline mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { q: 'How do I report inappropriate content?', a: 'Use the flag icon on any comment or content. Our moderation team reviews reports within 24 hours.' },
            { q: 'Can I suggest a civic issue?', a: 'Yes! Use the "Feedback" subject in the contact form. We review all suggestions weekly.' },
            { q: 'Is my voting data private?', a: 'Yes. Your individual support actions are private. We only show aggregate support counts publicly.' },
            { q: 'How accurate are the AI summaries?', a: 'AI summaries are tools to help understanding, not official interpretations. Always check original sources.' },
          ].map((faq, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-2xl">
              <h3 className="font-semibold text-on-surface mb-2">{faq.q}</h3>
              <p className="text-on-surface-variant">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    }, 3000)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Have questions about RallyPoint? We're here to help you engage with your community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                <p className="text-slate-600">support@rallypoint.app</p>
                <p className="text-sm text-slate-500">General inquiries and support</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Office</h3>
                <p className="text-slate-600">123 Civic Center Dr</p>
                <p className="text-slate-600">Tempe, AZ 85281</p>
                <p className="text-sm text-slate-500">By appointment only</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                <p className="text-slate-600">(480) 555-1234</p>
                <p className="text-sm text-slate-500">Mon-Fri, 9am-5pm MST</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-3">Response Time</h3>
            <p className="text-slate-600 mb-2">
              We typically respond to inquiries within 24-48 hours during business days.
            </p>
            <p className="text-sm text-slate-500">
              For urgent matters related to platform security or abuse, please include "URGENT" in your subject line.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Send a Message</h2>
          
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">Message Sent!</h3>
              <p className="text-green-700">
                Thank you for contacting us. We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors bg-white"
                >
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
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500 text-center">
                By submitting this form, you agree to our{' '}
                <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                  Privacy Policy
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-50 p-6 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-2">How do I report inappropriate content?</h3>
            <p className="text-slate-600">
              Use the flag icon on any comment or content. Our moderation team reviews reports within 24 hours.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-2">Can I suggest a civic issue?</h3>
            <p className="text-slate-600">
              Yes! Use the "Feedback" subject in the contact form. We review all suggestions weekly.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-2">Is my voting data private?</h3>
            <p className="text-slate-600">
              Yes. Your individual support actions are private. We only show aggregate support counts publicly.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-2">How accurate are the AI summaries?</h3>
            <p className="text-slate-600">
              AI summaries are tools to help understanding, not official interpretations. Always check original sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
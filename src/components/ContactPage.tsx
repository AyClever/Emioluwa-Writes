import React, { useState } from 'react';
import { ViewRoute } from '../types';
import { submitContactForm, submitSayHello } from '../lib/api';
import { 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Feather, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  MapPin, 
  Heart,
  Smile
} from 'lucide-react';

interface ContactPageProps {
  navigate: (route: ViewRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'say_hello'>('contact');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Say Hello Form State
  const [helloName, setHelloName] = useState('');
  const [helloEmail, setHelloEmail] = useState('');
  const [helloMessage, setHelloMessage] = useState('');
  const [helloSubmitting, setHelloSubmitting] = useState(false);
  const [helloSuccess, setHelloSuccess] = useState(false);
  const [helloError, setHelloError] = useState<string | null>(null);

  // Copy states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('lifeofgod2912@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+2347069318353');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setContactError('Please fill in all required fields.');
      return;
    }

    try {
      setContactSubmitting(true);
      setContactError(null);
      await submitContactForm({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      setContactError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleSayHelloSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helloName || !helloEmail || !helloMessage) {
      setHelloError('Please provide your name, email, and note.');
      return;
    }

    try {
      setHelloSubmitting(true);
      setHelloError(null);
      await submitSayHello({
        name: helloName,
        email: helloEmail,
        message: helloMessage
      });
      setHelloSuccess(true);
      setHelloName('');
      setHelloEmail('');
      setHelloMessage('');
    } catch (err: any) {
      setHelloError(err.message || 'Failed to submit message.');
    } finally {
      setHelloSubmitting(false);
    }
  };

  return (
    <div id="contact-page" className="min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DA] border border-[#E0D5C1] text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
            <Feather className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>Direct Reach</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#0D3B2E] tracking-tight">
            Contact & Say Hello
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-[#786D5F]">
            Whether you have an idea, a question, or simply want to share what a piece meant to you.
          </p>
        </div>

        {/* Top Info Cards: Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Phone Card */}
          <div className="paper-card p-6 sm:p-8 rounded-3xl border border-[#E0D5C1] flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C29B38]">
                Direct Line / WhatsApp
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                +234 706 931 8353
              </h3>
              <p className="font-sans text-xs text-[#57615D]">
                Available for professional inquiries, writing commissions, and literary events (West Africa Time / WAT).
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#EFE8DA]">
              <a
                href="tel:+2347069318353"
                id="phone-call-link"
                className="px-4 py-2 rounded-xl bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-colors"
              >
                Call Number
              </a>
              <button
                onClick={handleCopyPhone}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E] hover:bg-[#EFE8DA] transition-colors flex items-center gap-1.5"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPhone ? 'Copied' : 'Copy Number'}</span>
              </button>
            </div>
          </div>

          {/* Email Card */}
          <div className="paper-card p-6 sm:p-8 rounded-3xl border border-[#E0D5C1] flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C29B38]">
                Official Writing Inbox
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0D3B2E] truncate">
                lifeofgod2912@gmail.com
              </h3>
              <p className="font-sans text-xs text-[#57615D]">
                The quickest way to reach Emioluwa for essay feedback, guest columns, or thoughtful correspondence.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#EFE8DA]">
              <a
                href="mailto:lifeofgod2912@gmail.com"
                id="email-mailto-link"
                className="px-4 py-2 rounded-xl bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-colors"
              >
                Send Email
              </a>
              <button
                onClick={handleCopyEmail}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E] hover:bg-[#EFE8DA] transition-colors flex items-center gap-1.5"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* ---------------- INTERACTIVE TAB: FORM vs SAY HELLO ---------------- */}
        <div className="paper-card rounded-3xl overflow-hidden border border-[#E0D5C1] shadow-sm">
          
          {/* Tab Headers */}
          <div className="flex border-b border-[#E8DEC8] bg-[#F4EFE6]">
            <button
              id="tab-contact-form"
              onClick={() => {
                setActiveTab('contact');
                setContactSuccess(false);
              }}
              className={`flex-1 py-4.5 px-6 text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                activeTab === 'contact'
                  ? 'bg-[#FFFDF9] text-[#0D3B2E] border-b-2 border-[#0D3B2E]'
                  : 'text-[#57615D] hover:text-[#0D3B2E] hover:bg-[#EFE8DA]/50'
              }`}
            >
              <Mail className="w-4 h-4 text-[#C29B38]" />
              <span>General Inquiries & Collaboration</span>
            </button>

            <button
              id="tab-say-hello"
              onClick={() => {
                setActiveTab('say_hello');
                setHelloSuccess(false);
              }}
              className={`flex-1 py-4.5 px-6 text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                activeTab === 'say_hello'
                  ? 'bg-[#FFFDF9] text-[#0D3B2E] border-b-2 border-[#0D3B2E]'
                  : 'text-[#57615D] hover:text-[#0D3B2E] hover:bg-[#EFE8DA]/50'
              }`}
            >
              <Smile className="w-4 h-4 text-[#C29B38]" />
              <span>Say Hello (Reader Note / Chat)</span>
            </button>
          </div>

          <div className="p-8 sm:p-12 bg-[#FFFDF9]">
            
            {/* VIEW 1: CONTACT FORM */}
            {activeTab === 'contact' && (
              <div>
                {contactSuccess ? (
                  <div className="text-center py-10 space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">Message Received</h3>
                    <p className="font-sans text-sm text-[#57615D] max-w-md mx-auto">
                      Thank you for reaching out! Your message has been safely delivered to Emioluwa's desk. She will get back to you soon.
                    </p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-left space-y-1 mb-6">
                      <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">Send a Message</h3>
                      <p className="font-sans text-xs text-[#57615D]">
                        For writing commissions, speaking, feedback, or collaborative projects.
                      </p>
                    </div>

                    {contactError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                        {contactError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider mb-2">
                          Your Name *
                        </label>
                        <input
                          id="contact-name-input"
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Oluwaseun Adeleke"
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          id="contact-email-input"
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider mb-2">
                        Subject / Topic
                      </label>
                      <input
                        id="contact-subject-input"
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g. Essay Feedback / Collaboration Inquiry"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider mb-2">
                        Your Message *
                      </label>
                      <textarea
                        id="contact-message-input"
                        required
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                      />
                    </div>

                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-sm hover:bg-[#135241] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{contactSubmitting ? 'Sending...' : 'Send Message to Emioluwa'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* VIEW 2: SAY HELLO (READER NOTE / INBOX) */}
            {activeTab === 'say_hello' && (
              <div>
                {helloSuccess ? (
                  <div className="text-center py-10 space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-[#EFE8DA] text-[#0D3B2E] flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-[#C29B38] fill-[#C29B38]" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">Note Delivered with Warmth!</h3>
                    <p className="font-sans text-sm text-[#57615D] max-w-md mx-auto">
                      Emioluwa has received your note in her reader inbox. Thank you for connecting and sharing your heart!
                    </p>
                    <button
                      onClick={() => setHelloSuccess(false)}
                      className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all"
                    >
                      Send Another Hello
                    </button>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-6">
                    
                    {/* Chat Bubble Aesthetics */}
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DEC8] flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#0D3B2E] text-[#FAF7F2] flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm">
                        E
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm text-[#3A423F]">
                        <p className="font-serif font-bold text-[#0D3B2E]">Emioluwa says:</p>
                        <p className="font-serif italic text-[#57615D]">
                          "Hi there! Whether you loved a sentence, felt understood by an essay, or just want to introduce yourself from wherever you are reading, drop your note below. I read every single one."
                        </p>
                      </div>
                    </div>

                    {helloError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                        {helloError}
                      </div>
                    )}

                    <form onSubmit={handleSayHelloSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">
                            What's your name? *
                          </label>
                          <input
                            id="hello-name-input"
                            type="text"
                            required
                            value={helloName}
                            onChange={(e) => setHelloName(e.target.value)}
                            placeholder="Your name or nickname"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">
                            Your email (for a reply if you'd like) *
                          </label>
                          <input
                            id="hello-email-input"
                            type="email"
                            required
                            value={helloEmail}
                            onChange={(e) => setHelloEmail(e.target.value)}
                            placeholder="your.email@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">
                          Your note for Emioluwa *
                        </label>
                        <textarea
                          id="hello-message-input"
                          required
                          rows={4}
                          value={helloMessage}
                          onChange={(e) => setHelloMessage(e.target.value)}
                          placeholder="Tell me what you're thinking, what piece you read, or just say hi from your city..."
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                        />
                      </div>

                      <button
                        id="hello-submit-btn"
                        type="submit"
                        disabled={helloSubmitting}
                        className="w-full py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-sm hover:bg-[#135241] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 text-[#E4CA7E]" />
                        <span>{helloSubmitting ? 'Delivering note...' : 'Send Note to Emioluwa'}</span>
                      </button>
                    </form>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

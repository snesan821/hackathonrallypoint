/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  ArrowRight, 
  Home, 
  Bus, 
  TreePine, 
  GraduationCap, 
  Shield, 
  Leaf,
  ShieldCheck,
  Scale,
  Eye,
  Globe,
  MessageCircle,
  Mail
} from 'lucide-react';

const Logo = () => (
  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
  </svg>
);

const Header = () => (
  <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/15 px-6 lg:px-20 py-4 flex items-center justify-between whitespace-nowrap">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3 text-on-surface">
        <div className="size-6 text-primary">
          <Logo />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Modern Forum</h2>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {['How It Works', 'Issues', 'Impact', 'Safety'].map((item) => (
          <a key={item} href="#" className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors">
            {item}
          </a>
        ))}
      </nav>
    </div>
    <div className="flex flex-1 justify-end gap-4 items-center">
      <label className="hidden sm:flex items-center min-w-40 h-10 max-w-64 relative">
        <div className="absolute left-3 text-outline">
          <Search size={18} />
        </div>
        <input 
          className="w-full h-full pl-10 pr-4 rounded-lg bg-surface-container border-none text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
          placeholder="Search issues..."
        />
      </label>
      <div className="flex gap-2">
        <button className="px-5 h-10 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary-container transition-all">
          Get Started
        </button>
        <button className="px-5 h-10 bg-surface-container-high text-on-surface text-sm font-bold rounded-lg hover:bg-surface-variant transition-all">
          Login
        </button>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
    <div className="flex flex-col gap-8 order-2 lg:order-1">
      <div className="flex flex-col gap-4">
        <span className="text-primary font-bold tracking-widest text-xs uppercase">Your Voice Matters Here</span>
        <h1 className="text-on-surface text-5xl lg:text-7xl font-black leading-[1.1] tracking-[-0.03em]">
          Join the <br/><span className="text-primary italic font-headline">conversation</span> that shapes your city.
        </h1>
        <p className="text-on-surface-variant text-lg lg:text-xl leading-relaxed max-w-lg">
          A modern space for community engagement, transparent policy discussion, and collective action. Connect with neighbors and influence real change.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <button className="px-8 py-4 bg-primary text-on-primary text-base font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
          Get Started
        </button>
        <button className="px-8 py-4 bg-surface-container-highest text-on-surface text-base font-bold rounded-xl hover:bg-surface-variant transition-all">
          Explore Issues
        </button>
      </div>
    </div>
    <div className="relative order-1 lg:order-2">
      <div 
        className="w-full aspect-[4/3] rounded-3xl bg-center bg-cover shadow-2xl overflow-hidden" 
        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfaxVWPUyvuN7c-lh5aYeP9cAaBkTHeCgsSBLSI5qfCIFukvUT9wyGwd-2FCUa2VkHQ1A8a-0GUUjv57eUZLEFgAGqHdy97XJmz3tPavNKXwM-xyDTKYAdgaVsPwIJCcFmkoUPMsk-htjKGx3Xklb3at9B5mF6kzrertiv1W0lE-O3PHKUY0inYXYxFg-nYplaaNV_ydTCNiZSGpcUBfW6EvPiy4mDfIaEvafghWcKU9DMiZ564uiuSyS8i3Nkqma8UBRNs_naNC4")'}}
        aria-label="Group of diverse people in a community meeting discussing local policies."
      />
      <div className="absolute -bottom-10 -left-6 lg:-left-20 w-full max-w-sm bg-surface-container-lowest p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Trending Issue</span>
            <span className="text-on-surface-variant text-[10px] font-medium">2.4k active</span>
          </div>
          <h3 className="text-on-surface text-2xl font-bold leading-tight">Rent Stabilization Ordinance</h3>
          <p className="text-on-surface-variant text-sm leading-normal">Discussion on proposed amendments to local housing stability and tenant protections.</p>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary w-3/4"></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-2">
              <div className="size-6 rounded-full border-2 border-surface bg-slate-300"></div>
              <div className="size-6 rounded-full border-2 border-surface bg-slate-400"></div>
              <div className="size-6 rounded-full border-2 border-surface bg-slate-500"></div>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-container transition-colors">
              View Discussion
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Categories = () => {
  const categories = [
    { name: 'Housing', icon: Home },
    { name: 'Transit', icon: Bus },
    { name: 'Parks', icon: TreePine },
    { name: 'Education', icon: GraduationCap },
    { name: 'Safety', icon: Shield },
    { name: 'Environment', icon: Leaf },
  ];

  return (
    <section className="py-20 border-t border-outline-variant/15">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Browse by category</h2>
          <p className="text-on-surface-variant text-lg">Filter discussions by the topics that affect your daily life most. Every category is moderated for constructive dialogue.</p>
        </div>
        <a href="#" className="text-primary font-bold flex items-center gap-2 pb-1 border-b-2 border-primary/20 hover:border-primary transition-all">
          View all categories
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div key={cat.name} className="group bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4 hover:bg-primary transition-all cursor-pointer">
            <div className="size-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-on-primary transition-colors">
              <cat.icon size={24} />
            </div>
            <span className="font-bold text-on-surface group-hover:text-on-primary transition-colors">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Impact = () => (
  <section className="py-24 bg-surface-container-low rounded-3xl px-8 lg:px-20 my-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">Civic engagement that actually works.</h2>
        <p className="text-on-surface-variant text-lg mb-12">We bridge the gap between residents and city officials. Our platform ensures every verified voice is heard, documented, and delivered to decision-makers.</p>
        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col">
            <span className="text-primary text-5xl font-black italic font-headline">42</span>
            <span className="text-on-surface font-bold text-lg mt-2">Policy Changes</span>
            <p className="text-on-surface-variant text-sm">Directly influenced by community discussions.</p>
          </div>
          <div className="flex flex-col">
            <span className="text-primary text-5xl font-black italic font-headline">12k+</span>
            <span className="text-on-surface font-bold text-lg mt-2">Active Neighbors</span>
            <p className="text-on-surface-variant text-sm">Engaging in verified civil debate daily.</p>
          </div>
        </div>
      </div>
      <div className="bg-surface rounded-2xl p-2 shadow-inner border border-outline-variant/10">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr1UFr4ki6Ker95F23gM_fW1GWVmbQRPwbRcfiPCo8f5_YQ5qCLPvAnC9beSOIom4Mpe-KyqkG91RFgsfpsrFlGY-nMA2DcV-dEz1euRL6u_wD2J80NkOIOlWFDRCOf-5BL90K8sKxss_6ORJszKexXUtOEAP6vLfTkE1TJWwNHefV6NO_AnWARCGxVtokOSBh0nVRJePGRkSMQ08g-qNQhrnyIR6cAmuIZeRA3_lw-KI6Xd6kvsGnCHy3nqj5DaJkSVv600yPrPs" 
          alt="People sitting in a circle during a local forum discussion." 
          className="rounded-xl w-full h-[400px] object-cover"
        />
      </div>
    </div>
  </section>
);

const TrustSafety = () => {
  const features = [
    {
      title: 'Verified Residency',
      desc: 'We use address verification to ensure only real neighbors are voting and debating on local issues.',
      icon: ShieldCheck
    },
    {
      title: 'Civil Discourse',
      desc: 'Our AI moderation flags harassment while preserving heated, passionate policy debate.',
      icon: Scale
    },
    {
      title: 'Full Transparency',
      desc: 'See exactly how your feedback is being processed and shared with city council members.',
      icon: Eye
    }
  ];

  return (
    <section className="py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold mb-4">A safer space for citizens</h2>
        <p className="text-on-surface-variant text-lg">We prioritize accountability and respect. Our community standards are enforced by both technology and human moderation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all">
            <feature.icon className="text-primary mb-6" size={36} strokeWidth={1.5} />
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const CallToAction = () => (
  <section className="py-20 text-center">
    <div className="relative bg-primary text-on-primary p-12 lg:p-24 rounded-[3rem] overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern height="40" id="pattern-grid" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"></path>
          </pattern>
          <rect fill="url(#pattern-grid)" height="100%" width="100%"></rect>
        </svg>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-none">Ready to lead?</h2>
        <p className="text-lg lg:text-xl max-w-xl opacity-90">Start a discussion today or join one in progress. Your community is waiting to hear from you.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-10 py-5 bg-surface-container-lowest text-primary text-lg font-black rounded-2xl hover:bg-surface-bright transition-all">
            Create My Account
          </button>
          <button className="px-10 py-5 border-2 border-on-primary text-on-primary text-lg font-black rounded-2xl hover:bg-on-primary hover:text-primary transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-surface-container-lowest border-t border-outline-variant/15 py-12 px-6 lg:px-20">
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="flex flex-col gap-6 col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 text-on-surface">
          <div className="size-6 text-primary">
            <Logo />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Modern Forum</h2>
        </div>
        <p className="text-on-surface-variant max-w-sm">Empowering communities through digital democracy and transparent civic participation.</p>
      </div>
      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-lg font-headline">Platform</h4>
        {['How it Works', 'Issue Tracker', 'Community Guide', 'Case Studies'].map(link => (
          <a key={link} href="#" className="text-on-surface-variant hover:text-primary transition-colors">{link}</a>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-lg font-headline">Support</h4>
        {['Help Center', 'Trust & Safety', 'Privacy Policy', 'Contact Us'].map(link => (
          <a key={link} href="#" className="text-on-surface-variant hover:text-primary transition-colors">{link}</a>
        ))}
      </div>
    </div>
    <div className="max-w-[1280px] mx-auto border-t border-outline-variant/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <span className="text-outline text-sm">© 2024 Modern Forum. Built for the citizens.</span>
      <div className="flex gap-6">
        <Globe className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
        <MessageCircle className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
        <Mail className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-12 lg:py-20">
        <Hero />
        <Categories />
        <Impact />
        <TrustSafety />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

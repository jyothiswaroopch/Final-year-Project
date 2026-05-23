import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#E2E8F0] font-sans selection:bg-[#00f3ff] selection:text-[#0f172a] overflow-x-hidden">
      <div className="absolute top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-7xl flex justify-between items-center backdrop-blur-xl bg-white/5 rounded-2xl pl-6 pr-3 py-2 border border-white/10 shadow-lg">
          <Link to="/" className="flex items-center gap-3">
            <img src="/radar-logo-final.jpg" alt="Radar Logo" className="h-8 w-auto rounded-full object-contain" />
            <span className="text-xl font-black text-white tracking-tighter">RADAR</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-6 py-2.5 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 transition-all text-white">
              Log In
            </Link>
          </div>
        </nav>
      </div>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-[#94a3b8] leading-relaxed">
          <p>Last updated: May 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>At Radar Financial Analytics, we collect information to provide better services to our users. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Information you provide to us directly (such as when you create an account).</li>
              <li>Information we collect automatically when you use our services (such as IP address, device type, and usage patterns).</li>
              <li>Information from third-party services (such as OAuth providers if you choose to link them).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing, maintaining, and improving our services.</li>
              <li>Personalizing your experience on the Radar platform.</li>
              <li>Communicating with you about updates, security alerts, and support messages.</li>
              <li>Ensuring compliance with our Terms of Service and applicable laws.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
            <p>We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Your Rights</h2>
            <p>Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage your account settings directly within the Radar platform or contact our support team for assistance.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@radar-analytics.com.</p>
          </section>
        </div>
      </main>

      <footer className="relative z-10 py-6 border-t border-white/5 bg-[#0f1520]">
        <div className="max-w-[95vw] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
            <p>© 2026 Radar Financial Analytics. All rights reserved.</p>
            <div className="flex gap-6">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

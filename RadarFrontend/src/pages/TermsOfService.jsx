import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-[#94a3b8] leading-relaxed">
          <p>Last updated: May 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the Radar Financial Analytics platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
            <p>Radar provides real-time market research, analytics, and trading simulation tools. The information provided on the platform is for informational and educational purposes only and should not be construed as financial advice.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Accounts</h2>
            <p>To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service.</li>
              <li>Interfere with or disrupt the operation of the Service or the servers or networks used to make the Service available.</li>
              <li>Scrape, data mine, or otherwise programmatically extract data from the Service without express written permission.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. Radar Financial Analytics does not guarantee the accuracy, completeness, or timeliness of the information provided through the Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Limitation of Liability</h2>
            <p>In no event shall Radar Financial Analytics be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service or the information provided therein.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us at legal@radar-analytics.com.</p>
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

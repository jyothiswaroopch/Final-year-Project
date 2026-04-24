import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContactForm from './components/ContactForm';
import ContactInfo from './components/ContactInfo';
import FAQAccordion from './components/FAQAccordion';
import './HelpSupportPage.css';

const HelpSupportPage = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard/trader');
  };

  return (
    <div className="help-support-page">
      {/* Gradient Background */}
      <div className="help-gradient-bg" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="help-header"
      >
        <div className="help-header-content">
          <div className="help-header-left">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToDashboard}
              className="back-to-dashboard-btn help-back-left-btn"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </motion.button>
            <h1 className="help-title">Help & Support</h1>
            <p className="help-subtitle">
              Get help with insights, charts, and account access
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="help-container">
        {/* Two-Column Layout */}
        <div className="help-main-content">
          <div className="help-left-column">
            <ContactForm />
          </div>
          <div className="help-middle-column">
            <ContactInfo />
          </div>
        </div>

        {/* Report Issue Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="help-report-issue-section"
        >
          <div className="report-issue-card">
            <div className="report-issue-header">
              <h3 className="report-issue-title">Report a Detailed Issue</h3>
              <p className="report-issue-text">
                For complex issues, please fill out our detailed form
              </p>
            </div>
            <motion.a
              href="https://docs.google.com/forms/d/e/1FAIpQLScdAzOH-scxXFr4VjVwidnLvcjM5RRhwAr5NJ2uTVtswCQpHg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="report-issue-btn"
            >
              <ExternalLink size={18} />
              Open Google Form
            </motion.a>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="help-faq-container">
          <FAQAccordion />
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;

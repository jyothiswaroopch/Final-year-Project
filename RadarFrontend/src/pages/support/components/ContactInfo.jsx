import React from 'react';
import { Mail, Phone, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="help-contact-info"
    >
      <div className="info-card">
        <h3 className="info-title">Get in Touch</h3>
        <p className="info-subtitle">We're here to help</p>

        {/* Email */}
        <motion.div
          whileHover={{ x: 5 }}
          className="info-item"
        >
          <div className="info-icon email-icon">
            <Mail size={20} />
          </div>
          <div className="info-content">
            <p className="info-label">Email</p>
            <a
              href="mailto:support@radartrader.com"
              className="info-value email-link"
            >
              support@radartrader.com
            </a>
          </div>
        </motion.div>

        {/* Phone */}
        <motion.div
          whileHover={{ x: 5 }}
          className="info-item"
        >
          <div className="info-icon phone-icon">
            <Phone size={20} />
          </div>
          <div className="info-content">
            <p className="info-label">Phone</p>
            <a href="tel:+919391143994" className="info-value phone-link">
              +91 9391 143 994
            </a>
          </div>
        </motion.div>

        {/* Support Hours */}
        <motion.div
          whileHover={{ x: 5 }}
          className="info-item"
        >
          <div className="info-icon hours-icon">
            <Clock size={20} />
          </div>
          <div className="info-content">
            <p className="info-label">Support Hours</p>
            <p className="info-value">Monday - Friday, 9 AM - 6 PM IST</p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="info-divider" />

        {/* Footer Message */}
        <div className="info-footer">
          <Heart size={16} className="heart-icon" />
          <p className="footer-text">
            Your feedback helps us improve every day
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';

const initialForm = {
  name: '',
  issue: '',
  description: '',
  screenshot: null,
};

export default function IssueModal({ isOpen, issueType, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetModal = () => {
    setForm(initialForm);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="support-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="support-modal"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="support-modal-head">
              <div>
                <p className="support-modal-kicker">Support Ticket</p>
                <h3 className="support-modal-title">{issueType || 'Report Issue'}</h3>
              </div>
              <button type="button" className="support-icon-btn" onClick={handleClose} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="support-form">
                <label className="support-field">
                  <span>Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </label>

                <label className="support-field">
                  <span>Issue</span>
                  <input
                    value={form.issue || issueType || ''}
                    onChange={(e) => handleChange('issue', e.target.value)}
                    placeholder="Issue title"
                    required
                  />
                </label>

                <label className="support-field">
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what happened"
                    rows={4}
                    required
                  />
                </label>

                <label className="support-field support-file-field">
                  <span>Upload screenshot</span>
                  <div className="support-file-box">
                    <UploadCloud size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleChange('screenshot', e.target.files?.[0] || null)}
                    />
                  </div>
                </label>

                <div className="support-form-actions">
                  <button type="button" className="support-btn support-btn-muted" onClick={handleClose}>
                    Cancel
                  </button>
                  <button type="submit" className="support-btn support-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="support-success">
                <h4>Issue submitted successfully</h4>
                <p>Your ticket has been queued. We will update you shortly by email or live chat.</p>
                <button type="button" className="support-btn support-btn-primary" onClick={handleClose}>
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { ThumbsUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackForm = () => {
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedbackType: 'General',
    comments: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (rating) => {
    setFeedbackData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFeedbackData({
        rating: 0,
        feedbackType: 'General',
        comments: '',
      });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="help-feedback-form"
    >
      <h3 className="form-title">Share Your Feedback</h3>
      
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="form-success-message"
        >
          ✓ Thank you for your feedback! We appreciate your input.
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form-container">
        {/* Rating Stars */}
        <div className="form-group">
          <label className="form-label">How would you rate your experience?</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRatingChange(star)}
                className={`star-btn ${feedbackData.rating >= star ? 'active' : ''}`}
              >
                <Star size={24} />
              </motion.button>
            ))}
          </div>
          {feedbackData.rating > 0 && (
            <p className="rating-text">You rated: {feedbackData.rating} out of 5</p>
          )}
        </div>

        {/* Feedback Type */}
        <div className="form-group">
          <label htmlFor="feedbackType" className="form-label">
            Feedback Type
          </label>
          <select
            id="feedbackType"
            name="feedbackType"
            value={feedbackData.feedbackType}
            onChange={handleChange}
            className="form-select"
          >
            <option value="General">General Feedback</option>
            <option value="Bug">Bug Report</option>
            <option value="Feature">Feature Request</option>
            <option value="Performance">Performance Issue</option>
            <option value="Compliment">Compliment</option>
          </select>
        </div>

        {/* Comments */}
        <div className="form-group">
          <label htmlFor="comments" className="form-label">
            Your Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={feedbackData.comments}
            onChange={handleChange}
            placeholder="Tell us what you think..."
            className="form-textarea"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || feedbackData.rating === 0}
          className="feedback-submit-btn"
        >
          {loading ? (
            <span className="btn-loading">Sending...</span>
          ) : (
            <>
              <ThumbsUp size={18} />
              Send Feedback
            </>
          )}
        </motion.button>

        {/* Helper Text */}
        <p className="form-helper-text">
          💝 Your feedback helps us improve
        </p>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ item, isOpen, onToggle }) {
  const Icon = item.icon;

  return (
    <div className="support-faq-item">
      <button type="button" className="support-faq-trigger" onClick={onToggle}>
        <span className="support-faq-icon-wrap" aria-hidden="true">
          <Icon size={16} />
        </span>
        <span className="support-faq-question">{item.question}</span>
        <ChevronDown size={16} className={`support-faq-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="faq-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="support-faq-content-wrap"
          >
            <div className="support-faq-content">{item.answer}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

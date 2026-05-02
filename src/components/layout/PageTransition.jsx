/**
 * PageTransition - Wraps pages with enter/exit animations
 */

import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';

function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={className}
      style={{
        minHeight: '100%',
        paddingTop: '24px',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;


import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

export const item = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    }
  }
};

// New variants for more exciting animations
export const fadeInSlideUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

export const fadeInScaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

export const fastFadeInVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  }
};

export const popInVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    }
  }
};

export const slideInRightVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

export const slideInLeftVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInSlideUp: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInSlideUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInScale: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInScaleVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FastFadeIn: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fastFadeInVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PopIn: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={popInVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInRight: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideInRightVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInLeft: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideInLeftVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerChildren: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={item}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// For adding bounce and elastic effects to elements
export const BounceIn: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 15,
        }
      }}
      exit={{ 
        scale: 0,
        transition: {
          duration: 0.2,
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// For highlighting content with a pulsing effect
export const PulseHighlight: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [1, 0.85, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// For flip card effects
export const FlipCard: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ 
        rotateY: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut",
        }
      }}
      exit={{ 
        rotateY: 90,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: "easeIn",
        }
      }}
      className={className}
      style={{ perspective: "1000px" }}
    >
      {children}
    </motion.div>
  );
};


// Animation variants and configurations for consistent motion design
export const pageTransitions = {
  initial: { 
    opacity: 0, 
    x: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const modalTransitions = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const buttonHover = {
  scale: 1.02,
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
};

export const buttonTap = {
  scale: 0.98,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 17
  }
};

export const cardHover = {
  y: -5,
  scale: 1.02,
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20
  }
};

export const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInRight = {
  initial: { 
    opacity: 0, 
    x: 100 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.6,
    ease: "easeInOut",
    times: [0, 0.5, 1]
  }
};

export const rippleEffect = {
  scale: [0, 1],
  opacity: [0.8, 0],
  transition: {
    duration: 0.6,
    ease: "easeOut"
  }
};

export const loadingSpinner = {
  rotate: 360,
  transition: {
    duration: 1,
    ease: "linear",
    repeat: Infinity
  }
};

export const successCheckmark = {
  pathLength: [0, 1],
  opacity: [0, 1],
  transition: {
    duration: 0.8,
    ease: "easeInOut"
  }
};

export const toastSlideIn = {
  initial: { 
    opacity: 0, 
    x: 100,
    scale: 0.8
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

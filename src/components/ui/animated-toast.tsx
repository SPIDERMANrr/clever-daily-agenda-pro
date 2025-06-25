
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastProps } from '@/components/ui/toast';
import { toastSlideIn } from '@/utils/animations';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface AnimatedToastProps extends ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  open?: boolean;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({ 
  children, 
  variant = 'info',
  open = true,
  ...props 
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={toastSlideIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Toast {...props}>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                {getIcon()}
              </motion.div>
              {children}
            </div>
          </Toast>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

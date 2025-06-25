
import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { buttonHover, buttonTap, rippleEffect } from '@/utils/animations';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className, 
  ripple = false,
  loading = false,
  disabled,
  ...props 
}) => {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (ripple) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 600);
    }
    props.onClick?.(e);
  };

  return (
    <motion.div
      whileHover={!disabled && !loading ? buttonHover : {}}
      whileTap={!disabled && !loading ? buttonTap : {}}
      className="relative overflow-hidden rounded-xl"
    >
      <Button
        {...props}
        className={cn(className)}
        disabled={disabled || loading}
        onClick={handleClick}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
        
        {ripple && isClicked && (
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={rippleEffect}
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </Button>
    </motion.div>
  );
};

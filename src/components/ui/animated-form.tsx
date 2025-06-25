
import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

interface AnimatedFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const AnimatedForm: React.FC<AnimatedFormProps> = ({ 
  children, 
  onSubmit,
  className 
}) => {
  return (
    <motion.form
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      onSubmit={onSubmit}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.form>
  );
};

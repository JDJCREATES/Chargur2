import React from 'react';
import { motion } from 'framer-motion';

/**
 * BoltBadge component displays a "Powered by Bolt.new" badge in the bottom-left corner
 * with smooth Framer Motion animations and interactive hover effects.
 */
export const BoltBadge: React.FC = () => {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: 1
      }}
    >
      <motion.a 
        href="https://bolt.new/?rid=os72mi" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block transition-shadow duration-300 hover:shadow-2xl"
        whileHover={{ 
          scale: 2,
          rotate: [0, -2, 2, -2, 2, 0],
          transition: { 
            scale: { duration: 0.3, ease: "easeOut" },
            rotate: { 
              duration: 0.6, 
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1]
            }
          }
        }}
        whileTap={{ scale: 1.8 }}
      >
        <motion.img 
          src="https://storage.bolt.army/logotext_poweredby_360w.png"
          alt="Powered by Bolt.new badge" 
          className="h-8 md:h-10 w-auto shadow-lg opacity-90 hover:opacity-100"
          whileHover={{ 
            filter: "brightness(1.1) saturate(1.2)"
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.a>
    </motion.div>
  );
};

export default BoltBadge;
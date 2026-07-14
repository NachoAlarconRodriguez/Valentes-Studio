'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LotusDivider() {
  return (
    <div className="flex items-center w-full space-x-4 my-6 select-none pointer-events-none">
      {/* Left Fading Line */}
      <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-gold/45" />

      {/* Lotus Icon with Breathing Animation */}
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-gold/85 flex-shrink-0"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Central Petal */}
          <path d="M12 3C12 3 9 8 9 13C9 17 12 21 12 21C12 21 15 17 15 13C15 8 12 3 12 3Z" />
          {/* Left Inner Petal */}
          <path d="M12 9C9 9 6.5 11 6 14.5C5.5 17.5 8 20 10 20.5C10.5 20.6 11.5 20.8 12 21" />
          {/* Right Inner Petal */}
          <path d="M12 9C15 9 17.5 11 18 14.5C18.5 17.5 16 20 14 20.5C13.5 20.6 12.5 20.8 12 21" />
          {/* Left Outer Petal */}
          <path d="M12 14.5C9 15 4 15.5 3 18C2.5 19.3 4 20.5 5.5 20.7C7 21 10.5 21 12 21" />
          {/* Right Outer Petal */}
          <path d="M12 14.5C15 15 20 15.5 21 18C21.5 19.3 20 20.5 18.5 20.7C17 21 13.5 21 12 21" />
        </svg>
      </motion.div>

      {/* Right Fading Line */}
      <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent via-gold/20 to-gold/45" />
    </div>
  );
}

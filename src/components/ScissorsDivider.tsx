'use client';

import React from 'react';

export default function ScissorsDivider() {
  return (
    <div className="relative w-full h-8 flex items-center overflow-hidden mt-6">
      {/* HTML inline styles for standard, cross-compiler compatible animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scissorMove {
          0% {
            left: 0%;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          95%, 100% {
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes lineReveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.3;
          }
          5% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          95%, 100% {
            clip-path: inset(0 0% 0 0);
            opacity: 0.2;
          }
        }

        @keyframes scissorCut1 {
          0%, 100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(16deg);
          }
        }

        @keyframes scissorCut2 {
          0%, 100% {
            transform: rotate(4deg);
          }
          50% {
            transform: rotate(-16deg);
          }
        }

        .animate-move-scissors {
          animation: scissorMove 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        .animate-reveal-line {
          animation: lineReveal 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        .animate-scissor-blade-1 {
          animation: scissorCut1 0.45s ease-in-out infinite;
        }

        .animate-scissor-blade-2 {
          animation: scissorCut2 0.45s ease-in-out infinite;
        }
      `}} />

      {/* The background line that gets cut/revealed */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-bronze/60 to-transparent animate-reveal-line" />
      
      {/* The moving scissors container */}
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 animate-move-scissors">
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          fill="none" 
          className="text-bronze filter drop-shadow-[0_0_2.5px_rgba(205,127,50,0.55)]"
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Scissor pivot pin */}
          <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
          
          {/* Blade 1 group (Top handle, bottom blade) */}
          <g className="animate-scissor-blade-1" style={{ transformOrigin: '12px 12px' }}>
            <circle cx="6" cy="6" r="2.5" />
            <path d="M 8.28 8.28 L 20 20" />
          </g>
          
          {/* Blade 2 group (Bottom handle, top blade) */}
          <g className="animate-scissor-blade-2" style={{ transformOrigin: '12px 12px' }}>
            <circle cx="6" cy="18" r="2.5" />
            <path d="M 8.28 15.72 L 20 4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

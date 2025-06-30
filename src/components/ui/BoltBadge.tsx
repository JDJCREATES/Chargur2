import React, { useEffect, useRef } from 'react';

/**
 * BoltBadge component displays a "Powered by Bolt.new" badge in the bottom-left corner
 * with a smooth animation effect on initial render.
 */
export const BoltBadge: React.FC = () => {
  const badgeRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Add event listener to mark animation as complete
    const badge = badgeRef.current;
    if (badge) {
      badge.addEventListener('animationend', () => {
        badge.classList.add('animated');
      });
    }

    return () => {
      // Clean up event listener
      if (badge) {
        badge.removeEventListener('animationend', () => {
          badge.classList.add('animated');
        });
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a 
        href="https://bolt.new/?rid=os72mi" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block transition-all duration-300 hover:shadow-2xl"
      >
        <img 
          ref={badgeRef}
          src="https://storage.bolt.army/logotext_poweredby_360w.png"
          alt="Powered by Bolt.new badge" 
          className="h-8 md:h-10 w-auto shadow-lg opacity-90 hover:opacity-100 bolt-badge-intro bolt-badge-filter"
        />
      </a>
      
      {/* Styles for the badge animation */}
      <style jsx>{`
        .bolt-badge {
          transition: all 0.3s ease;
        }
        @keyframes badgeIntro {
          0% { transform: translateX(-100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .bolt-badge-intro {
          animation: badgeIntro 0.6s ease-out 1s both;
        }
        .bolt-badge-intro.animated {
          animation: none;
        }
      `}</style>
    </div>
  );
};

export default BoltBadge;
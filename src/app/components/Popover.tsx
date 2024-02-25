import React, { ReactNode, useRef, useState, useEffect } from 'react';

interface PopoverProps {
  children: ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();

      setPosition({
        top: e.clientY - rect.height - 30, // Adjust as needed
        left: e.clientX - rect.width / 5,
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        color: '#a4e786',
        transform: 'translateX(-50%)',
        backgroundColor: '#131338',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '8px',
        borderRadius: '4px',
        zIndex: 999,
      }}
    >
      {children}
    </div>
  );
};

export default Popover;

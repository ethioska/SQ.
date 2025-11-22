
import React from 'react';
import { SQLogo } from './icons';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center p-4 max-w-md mx-auto w-full h-16 border-b border-border-color/30 bg-glass backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-2">
          <SQLogo className="h-8 w-auto drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" />
      </div>
    </header>
  );
};

export default Header;

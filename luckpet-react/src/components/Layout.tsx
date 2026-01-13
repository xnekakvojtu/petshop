// src/components/Layout.tsx
import React from 'react';
import '../index.css';
import '../styles/components.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      {children}
    </div>
  );
};

export default Layout;
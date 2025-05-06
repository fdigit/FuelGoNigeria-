import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Search query:', query);
  };

  const handleLocationSelect = (location: string) => {
    // Implement location selection
    console.log('Selected location:', location);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={handleSearch} onLocationSelect={handleLocationSelect} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 
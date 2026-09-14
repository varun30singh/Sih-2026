import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar';
import { FarmerMobileNav } from '@/components/farmer/FarmerMobileNav';

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        <FarmerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <FarmerMobileNav />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}

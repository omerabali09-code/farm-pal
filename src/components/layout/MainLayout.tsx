import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-72 min-h-screen">
        <div className="container py-6 px-4 lg:px-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

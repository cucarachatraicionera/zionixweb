"use client";

import { Box } from '@mui/material';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #000510 0%, #0D1117 40%, #161B22 100%)',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      },
    }}>
      <Header />
      <main className="relative z-10">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </Box>
  );
} 
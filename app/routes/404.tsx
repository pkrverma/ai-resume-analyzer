import React, { useEffect } from "react";
import { useLocation } from "react-router";
import Navbar from "~/components/Navbar";

export default function NotFound() {
  const location = useLocation();
  
  // Handle Chrome DevTools and other system requests silently
  const isSystemRequest = location.pathname.includes('/.well-known/') || 
                         location.pathname.includes('/favicon.ico') ||
                         location.pathname.includes('/robots.txt') ||
                         location.pathname.includes('/devtools');
  
  useEffect(() => {
    // Log system requests in development for debugging
    if (isSystemRequest && import.meta.env.DEV) {
      console.log('System request intercepted:', location.pathname);
    }
  }, [isSystemRequest, location.pathname]);
  
  if (isSystemRequest) {
    // Return a minimal response for system requests without rendering anything
    return <div style={{ display: 'none' }}></div>;
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <h2 className="text-lg mb-8">Page Not Found</h2>
          <p className="text-base text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a 
            href="/" 
            className="primary-button inline-block px-6 py-3 text-white rounded-lg"
          >
            Go Home
          </a>
        </div>
      </section>
    </main>
  );
}
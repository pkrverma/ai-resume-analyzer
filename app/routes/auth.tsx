export const meta = () => [
  { title: "Recruit Mind | Auth" },
  { name: "description", content: "Log into your account" },
];
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Footer from "~/components/Footer";

const auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next") || "/"; // Default to home page
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      console.log("User authenticated, redirecting to:", next);
      // Small delay for better UX
      setTimeout(() => {
        navigate(next);
      }, 500);
    }
  }, [auth.isAuthenticated, next, navigate, isRedirecting]);

  const handleSignIn = async () => {
    try {
      await auth.signIn();
      // The useEffect will handle the redirect once auth.isAuthenticated becomes true
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 max-w-md mx-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Recruit Mind
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 leading-relaxed">
              Transform your career with our AI-powered resume analyzer. Get instant feedback, 
              improve your ATS compatibility, and land your dream job.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Unlimited Scans</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <button className="animate-pulse bg-indigo-500 hover:bg-indigo-600 min-h-[3rem] px-4 py-3 rounded-lg font-medium text-white transition-colors w-fit mx-auto">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-center leading-tight">Signing you in...</span>
                </div>
              </button>
            ) : isRedirecting ? (
              <button className="animate-pulse bg-green-500 hover:bg-green-600 min-h-[3rem] px-4 py-3 rounded-lg font-medium text-white transition-colors w-fit mx-auto">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-center leading-tight">Success! Redirecting...</span>
                </div>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button className="bg-red-500 hover:bg-red-600 min-h-[3rem] px-4 py-3 rounded-lg font-medium text-white transition-colors w-fit mx-auto" onClick={auth.signOut}>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-center leading-tight">Log Out</span>
                    </div>
                  </button>
                ) : (
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 min-h-[3rem] px-4 py-3 rounded-lg font-medium text-white w-fit mx-auto" onClick={handleSignIn}>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      
                      <span className="font-medium text-sm text-center leading-tight">Continue to Recruit Mind</span>
                    </div>
                  </button>
                )}
              </>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              By continuing, you agree to our terms and privacy policy
            </p>
          </div>
        </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default auth;

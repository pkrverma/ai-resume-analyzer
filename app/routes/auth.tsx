export const meta = () => [
  { title: "ResumeRadar | Auth" },
  { name: "description", content: "Log into your account" },
];
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

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
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>
          <div>
            {isLoading ? (
              <button className="auth-button animate-pulse">
                <p>Signing you in...</p>
              </button>
            ) : isRedirecting ? (
              <button className="auth-button animate-pulse bg-green-500 hover:bg-green-600">
                <p>✓ Success! Redirecting...</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button className="auth-button" onClick={auth.signOut}>
                    <p>Log Out</p>
                  </button>
                ) : (
                  <button className="auth-button" onClick={handleSignIn}>
                    <p>Log In</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default auth;

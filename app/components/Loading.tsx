import React from "react";

interface LoadingProps {
  title?: string;
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  title = "Loading", 
  message = "Please wait while we load your data...",
  className = ""
}) => {
  return (
    <main className={`bg-[url('/images/bg-main.svg')] bg-cover min-h-screen ${className}`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Loading;
import React from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

const Demo = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome to AI Resume Analyzer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your Smart Career Companion for Resume Optimization
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div id="analysis-dashboard" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Analysis Dashboard</h3>
              <p className="text-gray-600">Get comprehensive insights and scores for your resume performance.</p>
            </div>

            <div id="ats-section" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ATS Compatibility</h3>
              <p className="text-gray-600">Ensure your resume passes Applicant Tracking Systems with flying colors.</p>
            </div>

            <div id="skills-analysis" className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Skills Gap Analysis</h3>
              <p className="text-gray-600">Discover missing keywords and skills to boost your resume's impact.</p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <div id="upload-area" className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 mb-4">Drag and drop your PDF, DOC, or DOCX file here</p>
              <button className="primary-button px-6 py-3">
                Choose File
              </button>
            </div>
          </div>

          {/* Download Section */}
          <div id="download-section" className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Download Your Optimized Resume?</h3>
            <p className="text-lg mb-6 opacity-90">Get your enhanced resume with AI-powered improvements and detailed reports.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Download PDF
              </button>
              <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                Download Report
              </button>
            </div>
          </div>

          {/* Manage Resumes Section */}
          <div id="manage-resumes-section" className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-red-400">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Manage Your Resumes</h3>
                <p className="text-gray-600">Control your privacy and data storage preferences</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Privacy Control</h4>
                <p className="text-sm text-gray-600 mb-3">Manage your uploaded resumes and delete older versions to maintain your privacy.</p>
                <button className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                  Manage Resumes
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial Info */}
          <div className="text-center mt-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">New to AI Resume Analyzer?</h4>
              <p className="text-blue-700 mb-4">Take our interactive tutorial to learn how to get the most out of our platform!</p>
              <p className="text-sm text-blue-600">
                Click on your profile avatar in the top right corner and select "Tutorial Guide" to start the onboarding experience.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default Demo;
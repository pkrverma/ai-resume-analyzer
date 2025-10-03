import React, { useState, useEffect, useRef } from 'react';

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to AI Resume Analyzer",
    subtitle: "Your Smart Career Companion",
    content: "Get personalized insights, ATS optimization, and professional recommendations to make your resume stand out. Let's take a quick tour of the features that will boost your job search success."
  },
  {
    id: 2,
    title: "Upload Your Resume",
    subtitle: "PDF Format Only",
    content: "Click here to upload your resume in PDF format. Our AI will analyze your document and provide comprehensive feedback within seconds."
  },
  {
    id: 3,
    title: "AI Analysis Dashboard",
    subtitle: "Comprehensive Resume Insights",
    content: "View your overall resume score, strengths, and improvement areas. The dashboard provides ATS compatibility, keyword optimization, and formatting suggestions."
  },
  {
    id: 4,
    title: "ATS Compatibility Check",
    subtitle: "Beat Applicant Tracking Systems",
    content: "See how well your resume performs against ATS systems. Get specific recommendations to improve keyword density and formatting for better visibility."
  },
  {
    id: 5,
    title: "Skill Gap Analysis",
    subtitle: "Identify Missing Keywords",
    content: "Discover industry-relevant skills and keywords missing from your resume. Add suggested skills to increase your chances of getting noticed by recruiters."
  },
  {
    id: 6,
    title: "Manage Your Resumes",
    subtitle: "Privacy & Data Control",
    content: "Manage your uploaded resumes, delete older versions, or remove all data from our database to maintain your privacy. You have complete control over your stored information."
  },
  {
    id: 7,
    title: "Profile & History",
    subtitle: "Track Your Progress",
    content: "Access your analysis history, save multiple resume versions, and track improvements over time. Your data is securely stored for future reference."
  },
  {
    id: 8,
    title: "Ready to Optimize!",
    subtitle: "Start Improving Your Resume",
    content: "You're all set! Upload your resume to begin the analysis. Remember, you can access this tutorial anytime from the profile menu if you need a refresher."
  }
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset to step 1 when tutorial is opened
      setCurrentStep(0);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleClose = () => {
    onClose();
  };

  const handleStepClick = (stepIndex: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setIsAnimating(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="onboarding-overlay">
      {/* Semi-transparent background */}
      <div className="onboarding-backdrop" onClick={handleClose} />

      {/* Tutorial modal - always centered */}
      <div
        ref={tooltipRef}
        className="onboarding-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header with progress */}
        <div className="onboarding-header">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="onboarding-logo">
                <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
              </div>
              <div>
                <span className="onboarding-step-counter">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </span>
              </div>
            </div>
            <button onClick={handleClose} className="onboarding-close-btn">
              <img src="/icons/cross.svg" alt="Close" className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="onboarding-progress-bar">
            <div 
              className="onboarding-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="onboarding-content">
          <div className={`onboarding-text ${isAnimating ? 'onboarding-fade-out' : 'onboarding-fade-in'}`}>
            <h3 className="onboarding-title">
              {currentStepData.title}
            </h3>
            {currentStepData.subtitle && (
              <h4 className="onboarding-subtitle">
                {currentStepData.subtitle}
              </h4>
            )}
            <p className="onboarding-description">
              {currentStepData.content}
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="onboarding-indicators">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`onboarding-indicator ${
                index === currentStep 
                  ? 'active' 
                  : index < currentStep 
                    ? 'completed' 
                    : 'inactive'
              }`}
            />
          ))}
        </div>

        {/* Navigation footer */}
        <div className="onboarding-footer">
          <div className="flex justify-between items-center">
            <button onClick={handleSkip} className="onboarding-skip-btn">
              Skip Tutorial
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`onboarding-nav-btn ${currentStep === 0 ? 'disabled' : ''}`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="onboarding-nav-btn primary"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Get Started!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
import { prepareInstructions } from "constants/index";
import React, { useState, useEffect, type FormEvent } from "react";
import { Form, useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import Footer from "~/components/Footer";
import Notification from "~/components/Notification";

interface FormErrors {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  file: string;
}

interface FormValid {
  companyName: boolean;
  jobTitle: boolean;
  jobDescription: boolean;
  file: boolean;
}

const upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    file: "",
  });
  const [valid, setValid] = useState<FormValid>({
    companyName: false,
    jobTitle: false,
    jobDescription: false,
    file: false,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [auth.isAuthenticated, navigate]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    validateField("file", file);
  };

  const validateField = (fieldName: keyof FormErrors, value: string | File | null) => {
    let error = "";
    let isValid = false;

    switch (fieldName) {
      case "companyName":
        if (!value || (typeof value === "string" && value.trim().length === 0)) {
          error = "Company name is required";
        } else if (typeof value === "string" && value.trim().length < 2) {
          error = "Company name must be at least 2 characters long";
        } else {
          isValid = true;
        }
        break;
      case "jobTitle":
        if (!value || (typeof value === "string" && value.trim().length === 0)) {
          error = "Job title is required";
        } else if (typeof value === "string" && value.trim().length < 2) {
          error = "Job title must be at least 2 characters long";
        } else {
          isValid = true;
        }
        break;
      case "jobDescription":
        if (!value || (typeof value === "string" && value.trim().length === 0)) {
          error = "Job description is required";
        } else if (typeof value === "string" && value.trim().length < 10) {
          error = "Job description must be at least 10 characters long";
        } else {
          isValid = true;
        }
        break;
      case "file":
        if (!value) {
          error = "Please upload your resume (PDF file)";
        } else {
          isValid = true;
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    setValid(prev => ({ ...prev, [fieldName]: isValid }));
  };

  const handleInputChange = (fieldName: keyof FormErrors, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      file: "",
    };

    let isFormValid = true;

    // Validate company name
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      isFormValid = false;
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters long";
      isFormValid = false;
    }

    // Validate job title
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
      isFormValid = false;
    } else if (formData.jobTitle.trim().length < 2) {
      newErrors.jobTitle = "Job title must be at least 2 characters long";
      isFormValid = false;
    }

    // Validate job description
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
      isFormValid = false;
    } else if (formData.jobDescription.trim().length < 10) {
      newErrors.jobDescription = "Job description must be at least 10 characters long";
      isFormValid = false;
    }

    // Validate file
    if (!file) {
      newErrors.file = "Please upload your resume (PDF file)";
      isFormValid = false;
    }

    setErrors(newErrors);

    // Update valid state
    setValid({
      companyName: !newErrors.companyName,
      jobTitle: !newErrors.jobTitle,
      jobDescription: !newErrors.jobDescription,
      file: !newErrors.file,
    });

    return isFormValid;
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleAnalayze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading resume...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Failed to upload file");
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) return setStatusText("Failed to convert PDF to Image");
    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Failed to upload image");
    setStatusText("Preparing data...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing...");
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatusText("Failed to analyze resume");
    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis completed, redirecting...")
        navigate(`/resume/${uuid}`);
      };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotificationMessage("Please fill in all required fields correctly");
      return;
    }

    const { companyName, jobTitle, jobDescription } = formData;

    if (!file) {
      showNotificationMessage("Please upload your resume file");
      return;
    }

    handleAnalayze({ companyName, jobTitle, jobDescription, file });
  };
  const getInputClassName = (fieldName: keyof FormErrors) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
    
    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    } else if (valid[fieldName]) {
      return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }
    
    return `${baseClass} border-gray-300`;
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
      <Navbar />
      {showNotification && (
        <Notification
          message={notificationMessage}
          type="error"
          onClose={() => setShowNotification(false)}
        />
      )}
      <section className="main-section flex-grow">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="h-fit" alt="" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="uploadForm"
              className="flex flex-col gap-4 mt-8"
              onSubmit={handleSubmit}
            >
              <div className="form-div">
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name {errors.companyName && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className={getInputClassName("companyName")}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div className="form-div">
                <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title {errors.jobTitle && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="job-title"
                  id="job-title"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  className={getInputClassName("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.jobTitle}
                  </p>
                )}
              </div>
              <div className="form-div">
                <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description {errors.jobDescription && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  name="job-description"
                  id="job-description"
                  rows={5}
                  placeholder="Enter detailed job description, requirements, and responsibilities"
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                  className={getInputClassName("jobDescription")}
                />
                {errors.jobDescription && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.jobDescription}
                  </p>
                )}
              </div>
              <div className="form-div">
                <label htmlFor="uploader" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Resume {errors.file && <span className="text-red-500">*</span>}
                </label>
                <div id="upload-area" className={`w-full ${errors.file ? 'border-red-500' : valid.file ? 'border-green-500' : 'border-gray-300'} border rounded-md`}>
                  <FileUploader onFileSelect={handleFileSelect} />
                </div>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.file}
                  </p>
                )}
              </div>
              <button 
                className="primary-button transition-all duration-200 hover:opacity-90 disabled:opacity-50" 
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default upload;

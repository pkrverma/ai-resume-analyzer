import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore, exportDeleteKV } from "~/lib/puter";
import Loading from "~/components/Loading";
import ErrorPage from "~/components/ErrorPage";
import Notification from "~/components/Notification";
import Footer from "~/components/Footer";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set());
  const [loadingResume, setLoadingResume] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);

  const loadResumes = async () => {
    try {
      setLoadingResume(true);
      
      const kvItems = (await kv.list("resume:*", true)) as KVItem[];
      if (!kvItems || kvItems.length === 0) {
        setResumes([]);
        return;
      }

      const parsedResumes = kvItems
        .map((item): Resume | null => {
          try {
            const resume = JSON.parse(item.value) as Resume;
            // Validate required fields
            if (!resume.id || !resume.feedback || !resume.imagePath || !resume.resumePath) {
              console.warn(`Invalid resume data for key ${item.key}:`, resume);
              return null;
            }
            return resume;
          } catch (error) {
            console.error(`Failed to parse resume data for key ${item.key}:`, error);
            return null;
          }
        })
        .filter((resume): resume is Resume => resume !== null);
      
      console.log(`Loaded ${parsedResumes.length} valid resumes from database`);
      setResumes(parsedResumes);
      
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumes([]);
    } finally {
      setLoadingResume(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete all app data? This action cannot be undone."
    );
    
    if (!confirmDelete) return;

    try {
      setLoadingResume(true);
      
      // Delete all key-value store data (resumes, settings, etc.)
      console.log("Deleting all key-value store data...");
      const allKVItems = await kv.list("*", true) as KVItem[];
      
      if (allKVItems && allKVItems.length > 0) {
        const kvDeletePromises = allKVItems.map(item => {
          const key = typeof item === 'string' ? item : item.key;
          return exportDeleteKV(key);
        });
        await Promise.all(kvDeletePromises);
      }
      
      console.log("All data deleted successfully");
      
      // Clear local state
      setResumes([]);
      setSelectedResumes(new Set());
      
      // Reload data to confirm deletion
      await loadResumes();
      
      // Show success message
      alert("All app data has been wiped successfully!");
      
    } catch (error) {
      console.error("Error wiping app data:", error);
      alert("Error wiping app data. Please try again.");
    } finally {
      setLoadingResume(false);
    }
  };

  const handleDeleteMode = () => {
    setIsDeleteMode(true);
    setSelectedResumes(new Set());
  };

  const handleResumeSelect = (resumeId: string) => {
    const newSelected = new Set(selectedResumes);
    if (newSelected.has(resumeId)) {
      newSelected.delete(resumeId);
    } else {
      newSelected.add(resumeId);
    }
    setSelectedResumes(newSelected);
  };

  const handleDeleteSelected = async () => {
    try {
      setLoadingResume(true);
      
      // Create array of promises for parallel deletion
      const deletePromises = Array.from(selectedResumes).map(async (resumeId) => {
        const resume = resumes.find(r => r.id === resumeId);
        if (!resume) {
          console.warn(`Resume with ID ${resumeId} not found`);
          return;
        }

        console.log(`Deleting resume: ${resumeId}`);
        
        // Delete files from storage (both image and PDF)
        const fileDeletePromises = [];
        
        if (resume.imagePath) {
          fileDeletePromises.push(
            fs.delete(resume.imagePath).catch(error => 
              console.warn(`Failed to delete image ${resume.imagePath}:`, error)
            )
          );
        }
        
        if (resume.resumePath) {
          fileDeletePromises.push(
            fs.delete(resume.resumePath).catch(error => 
              console.warn(`Failed to delete resume file ${resume.resumePath}:`, error)
            )
          );
        }
        
        // Wait for file deletions to complete
        await Promise.all(fileDeletePromises);
        
        // Delete from key-value store
        await kv.delete(`resume:${resumeId}`);
        
        console.log(`Successfully deleted resume: ${resumeId}`);
      });
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Immediately update local state to remove deleted resumes
      const updatedResumes = resumes.filter(resume => !selectedResumes.has(resume.id));
      setResumes(updatedResumes);
      
      // Reset states
      setIsDeleteMode(false);
      setSelectedResumes(new Set());
      
      // Reload from database to ensure sync
      await loadResumes();
      
      console.log(`Successfully deleted ${selectedResumes.size} resume(s)`);
      
      // Show success notification
      const deletedCount = selectedResumes.size;
      setDeleteNotification(`Successfully deleted ${deletedCount} resume${deletedCount > 1 ? 's' : ''}`);
      setTimeout(() => setDeleteNotification(null), 3000);
      
    } catch (error) {
      console.error("Error deleting resumes:", error);
      // Show error notification
      setDeleteNotification("Error deleting resumes. Please try again.");
      setTimeout(() => setDeleteNotification(null), 3000);
      // Even if there's an error, try to reload to get current state
      await loadResumes();
    } finally {
      setLoadingResume(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteMode(false);
    setSelectedResumes(new Set());
  };

  if (isLoading) {
    return (
      <Loading 
        title="Loading Resume Management" 
        message="Please wait while we load your data..." 
      />
    );
  }

  if (error) {
    return (
      <ErrorPage 
        error={error} 
        title="Error Loading Data" 
      />
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen !pt-0 flex flex-col">
      {/* Back to Homepage Navigation */}
      <nav className="resume-nav">
        <Link to="/" className="back-button bg-white">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      
      {/* Delete Notification */}
      {deleteNotification && (
        <Notification 
          message={deleteNotification}
          type={deleteNotification.includes('Error') ? 'error' : 'success'}
          onClose={() => setDeleteNotification(null)}
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Resume Management</h1>

          {/* Resume Management Section */}
          <div className="mb-8">
            {!loadingResume && resumes.length > 0 && (
              <>
                <div className="flex justify-end gap-3 mb-4">
                  {isDeleteMode ? (
                    <>
                      <button
                        onClick={handleCancelDelete}
                        className="px-6 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedResumes.size === 0}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          selectedResumes.size === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        Delete ({selectedResumes.size})
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleDeleteMode}
                      className="px-6 py-2 rounded-lg font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Delete Resumes
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="relative border rounded-lg p-4 bg-gray-50">
                      {isDeleteMode && (
                        <div className="absolute top-2 right-2 z-10">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedResumes.has(resume.id)}
                              onChange={() => handleResumeSelect(resume.id)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-md border-2 transition-all duration-200 backdrop-blur-sm ${
                              selectedResumes.has(resume.id)
                                ? 'bg-red-500/80 border-red-500 shadow-lg'
                                : 'bg-white/60 border-gray-400 hover:border-red-400'
                            }`}>
                              {selectedResumes.has(resume.id) && (
                                <svg
                                  className="w-4 h-4 text-white absolute top-0.5 left-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                      <h3 className="font-semibold">{resume.companyName || "Resume"}</h3>
                      {resume.jobTitle && <p className="text-sm text-gray-600">{resume.jobTitle}</p>}
                      <p className="text-xs text-gray-500 mt-2">Score: {resume.feedback.overallScore}/100</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!loadingResume && resumes.length === 0 && (
              <p className="text-gray-500">No resumes found.</p>
            )}
            {loadingResume && (
              <p className="text-gray-500">Loading resumes...</p>
            )}
          </div>



          {/* Danger Zone */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 mb-4">
                This will permanently delete all your resumes and related data. This action cannot be undone.
              </p>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  resumes.length === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                onClick={() => handleDelete()}
                disabled={resumes.length === 0}
              >
                Delete All Resumes
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default WipeApp;

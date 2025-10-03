import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import resume from "./resume";
import Footer from "~/components/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recruit Mind " },
    { name: "description", content: "Smart feedback for your deam job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  const loadResumes = async () => {
    try {
      setLoadingResume(true);

      const resumeData = (await kv.list("resume:*", true)) as KVItem[];
      
      if (!resumeData || resumeData.length === 0) {
        console.log("No resumes found in database");
        setResumes([]);
        return;
      }
      
      // Parse and validate resume data
      const parsedResumes = resumeData
        .map((item) => {
          try {
            const resume = JSON.parse(item.value) as Resume;
            // Validate that required fields exist
            if (resume.id && resume.feedback) {
              return resume;
            } else {
              console.warn(`Invalid resume data for key ${item.key}:`, resume);
              return null;
            }
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



  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
      <Navbar />
      

      
      <section className="main-section flex-grow">
        <div className="page-heading py-8">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResume && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>
        {loadingResume &&(
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-sacn-2.gif" className="w-[200px]" alt="" />
          </div>
        )}
        {!loadingResume && resumes.length > 0 && (
          <>
            <div id="manage-resumes-section" className="w-full flex justify-end mb-4 sm:mb-6 mx-2 sm:mx-0">
              <Link 
                to="/wipe"
                className="px-4 sm:px-6 py-2 rounded-lg font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors text-sm sm:text-base"
              >
                Manage Resumes
              </Link>
            </div>
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          </>
        )}
        {!loadingResume && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 md:mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-sm sm:text-base md:text-lg font-semibold px-6 sm:px-8 py-3">Upload Resume</Link>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

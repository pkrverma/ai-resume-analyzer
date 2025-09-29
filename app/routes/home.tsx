import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import resume from "./resume";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeRadar " },
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

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResume(true);

      const resume = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = resume?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );
      console.log("parsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResume(false);
    };
    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
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
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
        {!loadingResume && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-lg font-semibold">Upload Resume</Link>
          </div>
        )}
      </section>
    </main>
  );
}

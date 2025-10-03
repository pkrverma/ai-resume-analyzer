import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";
import Footer from "~/components/Footer";

export const meta = () => [
  { title: "Recruit Mind | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;
      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
      console.log({ resumeUrl, imageUrl, feedback: data.feedback });
    };
    loadResume();
  }, [id]);

  return (
    <main className="!pt-0 min-h-screen flex flex-col">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse flex-grow">
        <section className="resume-image-section flex flex-col items-center justify-start">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border w-fit h-fit overflow-hidden max-w-full">
              <a href={resumeUrl} target="_blank" rel="noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-auto object-contain rounded-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
                  title="resume"
                  alt=""
                />
              </a>
            </div>
          )}
        </section>
        <section className="feedback-section">
          <h2 className="text-3xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div id="analysis-dashboard" className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <div id="skills-analysis">
                <Summary feedback={feedback}/>
              </div>
              <div id="ats-section">
                <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
              </div>
              <div id="download-section">
                <Details feedback = {feedback} />
              </div>
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" alt="" />
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default resume;

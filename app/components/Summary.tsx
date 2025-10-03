import React from "react";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70
      ? "text-green-600"
      : score > 49
        ? "text-yellow-600"
        : "text-red-600";
  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-sm sm:text-base md:text-lg">{title}</p>
          <ScoreBadge score={score} />
        </div>
          <p className="text-sm sm:text-base md:text-lg">
            <span className={textColor}>{score}</span>/100
          </p>
      </div>
    </div>
  );
};const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-col md:flex-row items-center p-4 gap-4">
        <ScoreGauge score={feedback.overallScore} />

        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-base sm:text-lg md:text-xl font-bold pt-1">Your Resume Score</h2>
          <p className="text-xs sm:text-md md:text-base text-gray-500">
            This score is calculated based on factors listed below.
          </p>
        </div>
      </div>
      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;

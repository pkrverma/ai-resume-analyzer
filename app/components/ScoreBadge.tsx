import React from 'react'

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const getBadgeStyles = () => {
    if (score > 70) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        label: 'Strong'
      };
    } else if (score > 49) {
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        label: 'Good Start'
      };
    } else {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        label: 'Needs Work'
      };
    }
  };

  const { bgColor, textColor, label } = getBadgeStyles();

  return (
    <div className={`${bgColor} ${textColor} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
      <p>{label}</p>
    </div>
  );
};

export default ScoreBadge;

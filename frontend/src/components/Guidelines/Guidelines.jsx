import React, { useState } from "react";
import { motion } from "framer-motion";


const competencyCharts = {
  discipline: [
    {
      level: 1,
      title: "Awareness",
      description:
        "You have academic / theoretical knowledge of the discipline but you are not able to independently provide content / perform tasks i.e. you have no working experience.",
    },
    {
      level: 2,
      title: "Basic Competency (Limited Proficiency)",
      description:
        "You are able to understand and discuss concepts and have some working experience, less than 3 years.",
    },
    {
      level: 3,
      title: "Intermediate Proficiency",
      description:
        "You have applied your knowledge and experience of this discipline over more than 3 years and independently provided input without guidance.",
    },
    {
      level: 4,
      title: "Advanced Proficiency",
      description:
        "You have more than 5 years of working experience in this discipline and can coach others and explain concepts in detail, including nuances and coupling to other disciplines.",
    },
    {
      level: 5,
      title: "Expert",
      description:
        "You have consistently demonstrated advanced knowledge and excellence in the discipline across 3 or more multi-disciplined projects, over more than 10 years, and are recognized as an expert outside the corporation.",
    },
  ],
  exploration: [
    {
      level: 1,
      title: "Novice",
      description: "You have less than 2 years Field experience.",
    },
    {
      level: 2,
      title: "Operator",
      description:
        "You have more than 2 years Field experience and are able to conduct Exploration Field Work under supervision.",
    },
    {
      level: 3,
      title: "Assistant Team Leader",
      description:
        "You have more than 3 years Field experience and can independently conduct geological mapping, operate geophysical equipment, carry out geochemical sampling, or supervise drilling operations.",
    },
    {
      level: 4,
      title: "Team Leader",
      description:
        "You have more than 4 years Field experience, led a survey/mapping/sampling/drilling team, and can QC the work output.",
    },
    {
      level: 5,
      title: "Crew Chief",
      description:
        "You have worked as a Team Leader for over 2 years, can coordinate multiple teams, solve problems, and take responsibility for the team's wellbeing.",
    },
  ],
  reporting: [
    {
      level: 1,
      title: "Novice Reporter",
      description:
        "There is no evidence of more than 1 documented report in the past 2 financial years.",
    },
    {
      level: 2,
      title: "Basic Reporter",
      description:
        "Evidence of at least 2 reports in the past 2 years, with at least 1 reviewed and uploaded to the Exploration repository By 10th July.",
    },
    {
      level: 3,
      title: "Proficient Reporter",
      description:
        "Evidence of at least 3 reports in the past 2 years, with at least 2 reviewed and uploaded to the Exploration repositor By 10th Julyy .",
    },
    {
      level: 4,
      title: "Advanced Reporter",
      description:
        "Evidence of at least 4 reports in the past 2 years, with at least 3 reviewed and uploaded to the Exploration repository By 10th July .",
    },
    {
      level: 5,
      title: "Master Reporter",
      description:
        "Evidence of at least 6 reports in the past 2 years, with at least 4 reviewed and uploaded to the Exploration repository  By 10th July.",
    },
  ],
};

export default function GuidelinesPopup({ onClose }) {
  const [selectedChart, setSelectedChart] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        {!selectedChart ? (
          <>
            <div className="popup-header">
              <h2>Competency Guidelines</h2>
              <button onClick={onClose} className="close-button">
                ✕
              </button>
            </div>
            <div className="chart-buttons-container">
              <button
                className="chart-button primary"
                onClick={() => setSelectedChart("discipline")}
              >
                Discipline Competency Chart
              </button>
              <button
                className="chart-button primary"
                onClick={() => setSelectedChart("exploration")}
              >
                Exploration Field Work Competency Chart
              </button>
              <button
                className="chart-button primary"
                onClick={() => setSelectedChart("reporting")}
              >
                Reporting Chart
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="popup-header">
              <h2>
                {selectedChart === "discipline"
                  ? "Discipline Competency Chart"
                  : selectedChart === "exploration"
                  ? "Exploration Field Work Competency Chart"
                  : "Reporting Chart"}
              </h2>
              <button
                onClick={() => setSelectedChart(null)}
                className="back-button"
              >
                ← Back
              </button>
            </div>
            <div className="levels-container">
              {competencyCharts[selectedChart].map((level, index) => (
                <div key={level.level} className="level-card">
                  <button
                    className={`level-header ${openIndex === index ? 'open' : ''}`}
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <span className="level-title-container">
                      <span className="level-number">
                        {level.level}
                      </span>
                      <span className="level-title">
                        {level.title}
                      </span>
                    </span>
                    <span className="level-toggle">
                      {openIndex === index ? "▲" : "▼"}
                    </span>
                  </button>
                  {openIndex === index && (
                    <motion.div
                      className="level-description"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {level.description}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
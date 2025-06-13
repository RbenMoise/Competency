import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function SpiderChart() {
  const subjects = ["Math", "English", "Science", "Sports", "Music"];
  const [scores, setScores] = useState({
    Math: 0,
    English: 0,
    Science: 0,
    Sports: 0,
    Music: 0,
  });

  const chartData = subjects.map((subject) => ({
    subject,
    A: parseInt(scores[subject]) || 0,
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScores((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Enter Scores</h2>
      <form style={{ marginBottom: "30px" }}>
        {subjects.map((subject) => (
          <div key={subject} style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "10px" }}>{subject}:</label>
            <input
              type="number"
              name={subject}
              min="0"
              max="10"
              value={scores[subject]}
              onChange={handleInputChange}
              style={{ padding: "5px", width: "60px" }}
            />
          </div>
        ))}
      </form>

      <RadarChart outerRadius={90} width={400} height={300} data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar
          name="Score"
          dataKey="A"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </div>
  );
}

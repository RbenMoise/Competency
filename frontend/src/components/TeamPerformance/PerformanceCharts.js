import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Rectangle,
} from "recharts";
import "./TeamPerformance.css";

const PerformanceCharts = ({
  chartType,
  analysisMode,
  scoreType,
  employeeData,
  disciplineData,
  disciplines,
  selectedDepartment,
  submissions,
}) => {
  // Log props to debug data issues
  console.log("PerformanceCharts props:", {
    employeeData,
    disciplineData,
    disciplines,
    submissions,
    scoreType,
    analysisMode,
    chartType,
  });

  const getSpiderChartData = () => {
    if (analysisMode === "employee") {
      const topEmployees = Object.values(employeeData || {}).slice(0, 3);
      return disciplines.map((disc) => {
        const dataPoint = { discipline: disc };
        topEmployees.forEach((emp) => {
          dataPoint[emp.name?.split(" ")[0] || "Unknown"] =
            emp.scores?.[scoreType === "all" ? "current" : scoreType]?.[disc] ||
            0;
        });
        return dataPoint;
      });
    } else {
      return disciplines.map((disc) => ({
        discipline: disc,
        Current: disciplineData?.[disc]?.average?.current || 0,
        Projected: disciplineData?.[disc]?.average?.projected || 0,
        Supervisor: disciplineData?.[disc]?.average?.supervisor || 0,
      }));
    }
  };

  const getBarChartData = () => {
    console.log("getBarChartData inputs:", {
      employeeData,
      disciplineData,
      analysisMode,
      scoreType,
    });
    let data;
    if (analysisMode === "employee") {
      data = Object.values(employeeData || {}).map((emp) => {
        const scores = emp.average || {};
        return {
          name: emp.name?.split(" ")[0] || "Unknown",
          Current: Number(scores.current) || 0,
          Projected: Number(scores.projected) || 0,
          Supervisor: Number(scores.supervisor) || 0,
        };
      });
    } else {
      data = disciplines.map((disc) => {
        const scores = disciplineData?.[disc]?.average || {};
        return {
          name: disc,
          Current: Number(scores.current) || 0,
          Projected: Number(scores.projected) || 0,
          Supervisor: Number(scores.supervisor) || 0,
        };
      });
    }
    // Fallback data if empty
    if (
      !data.length ||
      data.every((d) => !d.Current && !d.Projected && !d.Supervisor)
    ) {
      data = [{ name: "No Data", Current: 0, Projected: 0, Supervisor: 0 }];
    }
    console.log("BarChart data:", data);
    return data;
  };

  const getStackedBarChartData = () => {
    return getBarChartData();
  };

  const getLineChartData = () => {
    const employeeSubmissions = submissions.reduce((acc, sub) => {
      const key = sub.submitter?.name || "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(sub);
      return acc;
    }, {});

    if (analysisMode === "employee") {
      const topEmployees = Object.values(employeeData || {}).slice(0, 3);
      const dates = [
        ...new Set(
          submissions.map(
            (sub) => new Date(sub.submittedAt).toISOString().split("T")[0]
          )
        ),
      ].sort();
      return dates.map((date) => {
        const dataPoint = { date };
        topEmployees.forEach((emp) => {
          const sub = employeeSubmissions[emp.name]?.find(
            (s) => new Date(s.submittedAt).toISOString().split("T")[0] === date
          );
          dataPoint[emp.name?.split(" ")[0] || "Unknown"] = sub
            ? calculateAverage(sub[scoreType === "all" ? "current" : scoreType])
            : 0;
        });
        return dataPoint;
      });
    } else {
      const dates = [
        ...new Set(
          submissions.map(
            (sub) => new Date(sub.submittedAt).toISOString().split("T")[0]
          )
        ),
      ].sort();
      return dates.map((date) => {
        const dataPoint = { date };
        disciplines.forEach((disc) => {
          const scores = submissions
            .filter(
              (sub) =>
                new Date(sub.submittedAt).toISOString().split("T")[0] === date
            )
            .map(
              (sub) =>
                Number(
                  sub[scoreType === "all" ? "current" : scoreType]?.[disc]
                ) || 0
            )
            .filter((score) => score > 0);
          dataPoint[disc] =
            scores.length > 0
              ? (
                  scores.reduce((sum, score) => sum + score, 0) / scores.length
                ).toFixed(2)
              : 0;
        });
        return dataPoint;
      });
    }
  };

  const getBoxPlotData = () => {
    console.log("getBoxPlotData inputs:", {
      employeeData,
      submissions,
      analysisMode,
      scoreType,
    });
    let data;
    if (analysisMode === "employee") {
      data = Object.values(employeeData || {}).map((emp) => ({
        label: emp.name?.split(" ")[0] || "Unknown",
        data: Object.values(
          emp.scores?.[scoreType === "all" ? "current" : scoreType] || {}
        )
          .map(Number)
          .filter((score) => !isNaN(score) && score > 0),
      }));
    } else {
      data = disciplines.map((disc) => ({
        label: disc,
        data: submissions
          .map(
            (sub) =>
              Number(
                sub[scoreType === "all" ? "current" : scoreType]?.[disc]
              ) || 0
          )
          .filter((score) => score > 0),
      }));
    }
    // Compute quartiles for Recharts Box Plot
    const boxPlotData = data.map(({ label, data }) => {
      if (!data.length) {
        return { label, min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
      }
      const sorted = data.sort((a, b) => a - b);
      const min = Math.min(...sorted);
      const max = Math.max(...sorted);
      const median = sorted[Math.floor(sorted.length / 2)];
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
      const iqr = q3 - q1;
      const outlierThresholdLow = q1 - 1.5 * iqr;
      const outlierThresholdHigh = q3 + 1.5 * iqr;
      const outliers = sorted.filter(
        (v) => v < outlierThresholdLow || v > outlierThresholdHigh
      );
      return { label, min, q1, median, q3, max, outliers };
    });
    // Fallback if empty
    if (!boxPlotData.length || boxPlotData.every((d) => !d.data?.length)) {
      boxPlotData.push({
        label: "No Data",
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        outliers: [],
      });
    }
    console.log("BoxPlot data:", boxPlotData);
    return boxPlotData;
  };

  const calculateAverage = (scores) => {
    if (!scores) return 0;
    const values = Object.values(scores)
      .map(Number)
      .filter((score) => !isNaN(score));
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  };

  const renderSpiderChart = () => {
    const data = getSpiderChartData();
    const series =
      analysisMode === "employee"
        ? Object.values(employeeData || {})
            .slice(0, 3)
            .map((emp) => emp.name?.split(" ")[0] || "Unknown")
        : ["Current", "Projected", "Supervisor"];
    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="discipline" />
          <PolarRadiusAxis domain={[0, 5]} />
          {series.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={["#007bff", "#28a745", "#6f42c1"][index % 3]}
              fill={["#007bff", "#28a745", "#6f42c1"][index % 3]}
              fillOpacity={0.2}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    const data = getBarChartData();
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          {scoreType === "all" ? (
            <>
              <Bar dataKey="Current" fill="#007bff" />
              <Bar dataKey="Projected" fill="#28a745" />
              <Bar dataKey="Supervisor" fill="#6f42c1" />
            </>
          ) : (
            <Bar
              dataKey={scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}
              fill={
                scoreType === "current"
                  ? "#007bff"
                  : scoreType === "projected"
                  ? "#28a745"
                  : "#6f42c1"
              }
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderStackedBarChart = () => {
    const data = getStackedBarChartData();
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis domain={[0, 15]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Current" stackId="a" fill="#007bff" />
          <Bar dataKey="Projected" stackId="a" fill="#28a745" />
          <Bar dataKey="Supervisor" stackId="a" fill="#6f42c1" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => {
    const data = getLineChartData();
    const series =
      analysisMode === "employee"
        ? Object.values(employeeData || {})
            .slice(0, 3)
            .map((emp) => emp.name?.split(" ")[0] || "Unknown")
        : disciplines.slice(0, 3);
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          {series.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={["#007bff", "#28a745", "#6f42c1"][index % 3]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const BoxPlotChart = ({ data, scoreType }) => {
    console.log("BoxPlotChart data:", data);
    const CustomBoxPlot = (props) => {
      const { x, y, payload } = props;
      if (
        !payload.min &&
        !payload.q1 &&
        !payload.median &&
        !payload.q3 &&
        !payload.max
      )
        return null;

      const width = 30;
      const boxHeight = (payload.q3 - payload.q1) * 20; // Scale for visibility
      const medianY = y - (payload.median - payload.q1) * 20;
      const color =
        scoreType === "all"
          ? "#007bff"
          : scoreType === "current"
          ? "#007bff"
          : scoreType === "projected"
          ? "#28a745"
          : "#6f42c1";

      return (
        <g>
          {/* Whiskers */}
          <line
            x1={x}
            y1={y - (payload.max - payload.q1) * 20}
            x2={x}
            y2={y - (payload.q3 - payload.q1) * 20}
            stroke={color}
            strokeWidth={2}
          />
          <line
            x1={x}
            y1={y}
            x2={x}
            y2={y - (payload.q1 - payload.min) * 20}
            stroke={color}
            strokeWidth={2}
          />
          {/* Box */}
          <Rectangle
            x={x - width / 2}
            y={y - boxHeight}
            width={width}
            height={boxHeight}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
          />
          {/* Median Line */}
          <line
            x1={x - width / 2}
            y1={medianY}
            x2={x + width / 2}
            y2={medianY}
            stroke={color}
            strokeWidth={2}
          />
          {/* Outliers */}
          {payload.outliers.map((value, index) => (
            <circle
              key={index}
              cx={x}
              cy={y - (value - payload.q1) * 20}
              r={3}
              fill={color}
            />
          ))}
        </g>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend
            payload={[
              {
                value:
                  scoreType === "all"
                    ? "Current"
                    : scoreType.charAt(0).toUpperCase() + scoreType.slice(1),
                type: "rect",
                color:
                  scoreType === "all"
                    ? "#007bff"
                    : scoreType === "current"
                    ? "#007bff"
                    : scoreType === "projected"
                    ? "#28a745"
                    : "#6f42c1",
              },
            ]}
          />
          <Scatter data={data} shape={CustomBoxPlot} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="chart-wrapper">
      <h4>{chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</h4>
      {chartType === "spider" && renderSpiderChart()}
      {chartType === "bar" && renderBarChart()}
      {chartType === "stackedBar" && renderStackedBarChart()}
      {chartType === "line" && renderLineChart()}
      {chartType === "box" && (
        <BoxPlotChart data={getBoxPlotData()} scoreType={scoreType} />
      )}
    </div>
  );
};

export default PerformanceCharts;

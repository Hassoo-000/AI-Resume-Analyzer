import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";

export default function ScoreCircle({ score, label }) {
  const data = [
    {
      name: label,
      value: score,
      fill:
        score >= 80
          ? "#22c55e"
          : score >= 60
          ? "#3b82f6"
          : "#ef4444",
    },
  ];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <RadialBarChart
        width={180}
        height={180}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={15}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
        />
      </RadialBarChart>

      <div className="-mt-24 text-center">
        <div className="text-3xl font-bold">{score}%</div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}
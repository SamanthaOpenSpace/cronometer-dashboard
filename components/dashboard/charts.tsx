"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from "recharts";

type NutritionChartPoint = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function NutritionChart({ data }: { data: NutritionChartPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="calories" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="protein" stroke="#16a34a" dot={false} />
          <Line type="monotone" dataKey="carbs" stroke="#ea580c" dot={false} />
          <Line type="monotone" dataKey="fat" stroke="#9333ea" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type BodyChartPoint = {
  date: string;
  weight: number;
  recovery: number;
  hrv: number;
};

export function BodyChart({ data }: { data: BodyChartPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#2563eb" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="recovery" stroke="#16a34a" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="hrv" stroke="#d946ef" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MicronutrientChart({
  data
}: {
  data: { nutrient: string; pct: number }[];
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nutrient" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="pct" fill="#2563eb" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

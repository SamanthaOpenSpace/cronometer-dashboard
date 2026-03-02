"use client";

import { useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { BiometricsRow, DailySummaryRow, ServingRow } from "@/lib/types";
import { BodyChart, MicronutrientChart, NutritionChart } from "@/components/dashboard/charts";

type Props = {
  overview: { today: DailySummaryRow | null; biometrics: BiometricsRow | null };
  nutrition: DailySummaryRow[];
  body: BiometricsRow[];
  foods: ServingRow[];
};

const goals = {
  vitamin_d_mcg: 15,
  vitamin_c_mg: 90,
  iron_mg: 18,
  magnesium_mg: 420
};

export function DashboardView({ overview, nutrition, body, foods }: Props) {
  const [startDate, setStartDate] = useState<string>(nutrition[0]?.date ?? "");
  const [endDate, setEndDate] = useState<string>(nutrition[nutrition.length - 1]?.date ?? "");

  const filteredNutrition = useMemo(
    () => nutrition.filter((n) => n.date >= startDate && n.date <= endDate),
    [nutrition, startDate, endDate]
  );

  const filteredFood = useMemo(
    () => foods.filter((f) => f.date >= startDate && f.date <= endDate),
    [foods, startDate, endDate]
  );

  const filteredBody = useMemo(
    () => body.filter((row) => row.date >= startDate && row.date <= endDate),
    [body, startDate, endDate]
  );

  const micronutrientData = useMemo(() => {
    if (!filteredNutrition.length) return [];
    const latest = filteredNutrition[filteredNutrition.length - 1];
    return [
      { nutrient: "Vit D", pct: Math.round(((latest.vitamin_d_mcg ?? 0) / goals.vitamin_d_mcg) * 100) },
      { nutrient: "Vit C", pct: Math.round(((latest.vitamin_c_mg ?? 0) / goals.vitamin_c_mg) * 100) },
      { nutrient: "Iron", pct: Math.round(((latest.iron_mg ?? 0) / goals.iron_mg) * 100) },
      {
        nutrient: "Magnesium",
        pct: Math.round(((latest.magnesium_mg ?? 0) / goals.magnesium_mg) * 100)
      }
    ];
  }, [filteredNutrition]);

  const dailyFoods = useMemo(() => {
    return filteredFood.reduce<Record<string, ServingRow[]>>((acc, row) => {
      (acc[row.date] ??= []).push(row);
      return acc;
    }, {});
  }, [filteredFood]);

  const exportText = useMemo(
    () => buildLlmFriendlyExport({ startDate, endDate, nutrition: filteredNutrition, foods: filteredFood, biometrics: filteredBody }),
    [startDate, endDate, filteredNutrition, filteredFood, filteredBody]
  );

  const setQuickRange = (days: number) => {
    if (!nutrition.length) return;
    const latestDate = nutrition[nutrition.length - 1]?.date;
    if (!latestDate) return;
    const rangeEnd = parseISO(latestDate);
    const rangeStart = subDays(rangeEnd, days - 1);
    setStartDate(format(rangeStart, "yyyy-MM-dd"));
    setEndDate(latestDate);
  };

  const exportData = () => {
    const blob = new Blob([exportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronometer-llm-export-${startDate}-to-${endDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold">Cronometer Health Dashboard</h1>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Calories" value={overview.today?.calories} unit="kcal" />
        <MetricCard label="Weight" value={overview.biometrics?.weight_kg} unit="kg" />
        <MetricCard label="Recovery" value={overview.biometrics?.recovery_score} unit="%" />
        <MetricCard label="Protein" value={overview.today?.protein_g} unit="g" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <label>
              Start {" "}
              <input
                className="rounded border px-2 py-1"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End {" "}
              <input
                className="rounded border px-2 py-1"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button
              className="rounded border px-2 py-1"
              type="button"
              onClick={() => setQuickRange(7)}
            >
              Last 7 days
            </button>
            <button
              className="rounded border px-2 py-1"
              type="button"
              onClick={() => setQuickRange(30)}
            >
              Last 30 days
            </button>
            <button
              className="rounded border px-2 py-1"
              type="button"
              onClick={() => {
                setStartDate(nutrition[0]?.date ?? "");
                setEndDate(nutrition[nutrition.length - 1]?.date ?? "");
              }}
            >
              All dates
            </button>
            <button className="rounded bg-primary px-3 py-1 font-medium text-primary-foreground" type="button" onClick={exportData}>
              Export LLM Report
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <NutritionChart
            data={filteredNutrition.map((row) => ({
              date: format(parseISO(row.date), "MMM d"),
              calories: row.calories ?? 0,
              protein: row.protein_g ?? 0,
              carbs: row.carbs_g ?? 0,
              fat: row.fat_g ?? 0
            }))}
          />
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium">Vitamin & Mineral Status (latest day)</h3>
            <MicronutrientChart data={micronutrientData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyChart
            data={filteredBody.map((row) => ({
              date: format(parseISO(row.date), "MMM d"),
              weight: row.weight_kg ?? 0,
              recovery: row.recovery_score ?? 0,
              hrv: row.hrv_ms ?? 0
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Food Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dailyFoods).map(([date, rows]) => (
            <div key={date} className="rounded-lg border">
              <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
                <p className="font-medium">{format(parseISO(date), "EEEE, MMM d")}</p>
                <Badge>{rows.length} foods</Badge>
              </div>
              <Table>
                <THead>
                  <TR>
                    <TH>Meal</TH>
                    <TH>Food</TH>
                    <TH>Qty</TH>
                    <TH>Calories</TH>
                    <TH>P/C/F</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.id}>
                      <TD>{r.meal ?? "-"}</TD>
                      <TD>{r.food_name}</TD>
                      <TD>{r.quantity ?? "-"} {r.unit ?? ""}</TD>
                      <TD>{r.calories ?? "-"}</TD>
                      <TD>
                        {(r.protein_g ?? 0).toFixed(1)}/{(r.carbs_g ?? 0).toFixed(1)}/{(r.fat_g ?? 0).toFixed(1)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function average(values: Array<number | null | undefined>) {
  const cleanValues = values.filter((value): value is number => typeof value === "number");
  if (!cleanValues.length) return null;
  return cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length;
}

function buildLlmFriendlyExport({
  startDate,
  endDate,
  nutrition,
  foods,
  biometrics
}: {
  startDate: string;
  endDate: string;
  nutrition: DailySummaryRow[];
  foods: ServingRow[];
  biometrics: BiometricsRow[];
}) {
  const foodsByMeal = foods.reduce<Record<string, ServingRow[]>>((acc, row) => {
    const key = (row.meal ?? "unspecified").toLowerCase();
    (acc[key] ??= []).push(row);
    return acc;
  }, {});

  const mealSummary = ["breakfast", "lunch", "dinner"].map((meal) => {
    const rows = foodsByMeal[meal] ?? [];
    const uniqueFoods = [...new Set(rows.map((row) => row.food_name))].slice(0, 10);
    return {
      meal,
      entries: rows.length,
      avgCalories: average(rows.map((row) => row.calories)),
      topFoods: uniqueFoods
    };
  });

  const dailyFoodBreakdown = foods.reduce<Record<string, Record<string, string[]>>>((acc, row) => {
    const meal = row.meal ?? "Unspecified";
    (acc[row.date] ??= {});
    (acc[row.date][meal] ??= []).push(row.food_name);
    return acc;
  }, {});

  const weightValues = biometrics
    .filter((row) => typeof row.weight_kg === "number")
    .map((row) => ({ date: row.date, weight: row.weight_kg as number }));

  const weightTrend = weightValues.length
    ? `${weightValues[0].weight.toFixed(1)}kg -> ${weightValues[weightValues.length - 1].weight.toFixed(1)}kg`
    : "No weight data in selected range";

  return [
    "# Cronometer LLM-Friendly Health Export",
    "",
    "## Report Metadata",
    `- Date range: ${startDate || "N/A"} to ${endDate || "N/A"}`,
    `- Days with nutrition data: ${nutrition.length}`,
    `- Days with biometrics data: ${biometrics.length}`,
    `- Generated at: ${new Date().toISOString()}`,
    "",
    "## Nutrition Averages (selected range)",
    `- Avg calories: ${formatNumber(average(nutrition.map((row) => row.calories)), "kcal")}`,
    `- Avg protein: ${formatNumber(average(nutrition.map((row) => row.protein_g)), "g")}`,
    `- Avg carbs: ${formatNumber(average(nutrition.map((row) => row.carbs_g)), "g")}`,
    `- Avg fat: ${formatNumber(average(nutrition.map((row) => row.fat_g)), "g")}`,
    `- Avg vitamin D: ${formatNumber(average(nutrition.map((row) => row.vitamin_d_mcg)), "mcg")}`,
    `- Avg vitamin C: ${formatNumber(average(nutrition.map((row) => row.vitamin_c_mg)), "mg")}`,
    `- Avg iron: ${formatNumber(average(nutrition.map((row) => row.iron_mg)), "mg")}`,
    `- Avg magnesium: ${formatNumber(average(nutrition.map((row) => row.magnesium_mg)), "mg")}`,
    "",
    "## Meal Patterns (breakfast/lunch/dinner)",
    ...mealSummary.flatMap((meal) => [
      `- ${capitalize(meal.meal)}:`,
      `  - Entries logged: ${meal.entries}`,
      `  - Avg calories per entry: ${formatNumber(meal.avgCalories, "kcal")}`,
      `  - Common foods: ${meal.topFoods.join(", ") || "None"}`
    ]),
    "",
    "## Daily Food Log Summary",
    ...Object.entries(dailyFoodBreakdown).flatMap(([date, meals]) => [
      `- ${date}:`,
      ...Object.entries(meals).map(([meal, mealFoods]) => `  - ${meal}: ${mealFoods.join(", ")}`)
    ]),
    "",
    "## Weight Flow",
    `- Trend: ${weightTrend}`,
    `- Avg weight: ${formatNumber(average(biometrics.map((row) => row.weight_kg)), "kg")}`,
    ...weightValues.map((entry) => `- ${entry.date}: ${entry.weight.toFixed(1)} kg`),
    "",
    "## Device/Biometrics Info (selected range)",
    "- Device source fields are not available in the current dataset.",
    `- Avg resting HR: ${formatNumber(average(biometrics.map((row) => row.resting_hr)), "bpm")}`,
    `- Avg HRV: ${formatNumber(average(biometrics.map((row) => row.hrv_ms)), "ms")}`,
    `- Avg recovery score: ${formatNumber(average(biometrics.map((row) => row.recovery_score)), "%")}`,
    `- Avg body fat: ${formatNumber(average(biometrics.map((row) => row.body_fat_percent)), "%")}`
  ].join("\n");
}

function formatNumber(value: number | null, unit: string) {
  return value == null ? `N/A ${unit}` : `${value.toFixed(1)} ${unit}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function MetricCard({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value != null ? value.toFixed(1) : "--"}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );
}

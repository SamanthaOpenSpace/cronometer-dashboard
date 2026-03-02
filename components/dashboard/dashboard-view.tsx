"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
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
            data={body.map((row) => ({
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

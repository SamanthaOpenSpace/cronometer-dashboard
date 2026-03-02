import { subDays } from "date-fns";
import { getSupabaseClient } from "@/lib/supabase";
import { BiometricsRow, DailySummaryRow, ServingRow } from "@/lib/types";

const supabase = getSupabaseClient();
const todayISO = new Date().toISOString().slice(0, 10);

export async function getOverviewData() {
  const [summaryRes, biometricsRes] = await Promise.all([
    supabase
      .from("cronometer_daily_summary")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .returns<DailySummaryRow[]>(),
    supabase
      .from("cronometer_biometrics")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .returns<BiometricsRow[]>()
  ]);

  if (summaryRes.error) throw summaryRes.error;
  if (biometricsRes.error) throw biometricsRes.error;

  return {
    today: summaryRes.data?.[0] ?? null,
    biometrics: biometricsRes.data?.[0] ?? null
  };
}

export async function getNutritionData(rangeDays = 30) {
  const startDate = subDays(new Date(), rangeDays).toISOString().slice(0, 10);

  const summaryRes = await supabase
    .from("cronometer_daily_summary")
    .select("*")
    .gte("date", startDate)
    .lte("date", todayISO)
    .order("date", { ascending: true })
    .returns<DailySummaryRow[]>();

  if (summaryRes.error) throw summaryRes.error;
  return summaryRes.data ?? [];
}

export async function getBodyData(rangeDays = 90) {
  const startDate = subDays(new Date(), rangeDays).toISOString().slice(0, 10);
  const biometricsRes = await supabase
    .from("cronometer_biometrics")
    .select("*")
    .gte("date", startDate)
    .lte("date", todayISO)
    .order("date", { ascending: true })
    .returns<BiometricsRow[]>();

  if (biometricsRes.error) throw biometricsRes.error;
  return biometricsRes.data ?? [];
}

export async function getFoodData(startDate: string, endDate: string) {
  const servingsRes = await supabase
    .from("cronometer_servings")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .returns<ServingRow[]>();

  if (servingsRes.error) throw servingsRes.error;
  return servingsRes.data ?? [];
}

import { subDays } from "date-fns";
import { getSupabaseClient } from "@/lib/supabase";
import { BiometricsRow, DailySummaryRow, ServingRow } from "@/lib/types";

type DbDailySummaryRow = Omit<DailySummaryRow, "date"> & { entry_date: string };
type DbBiometricsRow = Omit<BiometricsRow, "date"> & { entry_date: string };
type DbServingRow = Omit<ServingRow, "date"> & { entry_date: string };

const supabase = getSupabaseClient();
const todayISO = new Date().toISOString().slice(0, 10);

export async function getOverviewData() {
  const [summaryRes, biometricsRes] = await Promise.all([
    supabase
      .from("cronometer_daily_summary")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(1)
      .returns<DbDailySummaryRow[]>(),
    supabase
      .from("cronometer_biometrics")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(1)
      .returns<DbBiometricsRow[]>()
  ]);

  if (summaryRes.error) throw summaryRes.error;
  if (biometricsRes.error) throw biometricsRes.error;

  return {
    today: summaryRes.data?.[0]
      ? { ...summaryRes.data[0], date: summaryRes.data[0].entry_date }
      : null,
    biometrics: biometricsRes.data?.[0]
      ? { ...biometricsRes.data[0], date: biometricsRes.data[0].entry_date }
      : null
  };
}

export async function getNutritionData(rangeDays = 30) {
  const startDate = subDays(new Date(), rangeDays).toISOString().slice(0, 10);

  const summaryRes = await supabase
    .from("cronometer_daily_summary")
    .select("*")
    .gte("entry_date", startDate)
    .lte("entry_date", todayISO)
    .order("entry_date", { ascending: true })
    .returns<DbDailySummaryRow[]>();

  if (summaryRes.error) throw summaryRes.error;
  return (summaryRes.data ?? []).map((row) => ({ ...row, date: row.entry_date }));
}

export async function getBodyData(rangeDays = 90) {
  const startDate = subDays(new Date(), rangeDays).toISOString().slice(0, 10);
  const biometricsRes = await supabase
    .from("cronometer_biometrics")
    .select("*")
    .gte("entry_date", startDate)
    .lte("entry_date", todayISO)
    .order("entry_date", { ascending: true })
    .returns<DbBiometricsRow[]>();

  if (biometricsRes.error) throw biometricsRes.error;
  return (biometricsRes.data ?? []).map((row) => ({ ...row, date: row.entry_date }));
}

export async function getFoodData(startDate: string, endDate: string) {
  const servingsRes = await supabase
    .from("cronometer_servings")
    .select("*")
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: false })
    .returns<DbServingRow[]>();

  if (servingsRes.error) throw servingsRes.error;
  return (servingsRes.data ?? []).map((row) => ({ ...row, date: row.entry_date }));
}
